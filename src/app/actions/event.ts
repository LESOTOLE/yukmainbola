"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { snap } from "@/lib/midtrans";

export async function registerEvent(eventId: string, usePoints: boolean = false) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, message: "Silakan login terlebih dahulu untuk mendaftar event." };
    }

    // Get user profile for payment details and points
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, points_balance")
      .eq("id", user.id)
      .single();

    // Get event details for payment amount
    const { data: event } = await supabase
      .from("events")
      .select("*, venues(name)")
      .eq("id", eventId)
      .single();

    if (!event) {
      return { success: false, message: "Event tidak ditemukan." };
    }

    // Insert participant as pending
    const { data: participant, error: insertError } = await supabase
      .from("event_participants")
      .insert({
        event_id: eventId,
        user_id: user.id,
        status: "registered",
        payment_status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return { success: false, message: "Anda sudah terdaftar di event ini." };
      }
      if (insertError.message.includes("max_participants") || insertError.message.includes("current_participants")) {
        return { success: false, message: "Maaf, kuota untuk event ini sudah penuh." };
      }
      console.error("Event registration error:", insertError);
      return { success: false, message: "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi." };
    }

    // Generate Midtrans Snap Token
    const venueName = Array.isArray(event.venues) ? event.venues[0]?.name : event.venues?.name;
    const orderId = `EVT-${participant.id.split('-')[0]}-${Date.now()}`;
    
    // Calculate points to use
    let pointsToUse = 0;
    if (usePoints && profile?.points_balance && profile.points_balance > 0) {
      const maxPoints = Math.floor(event.price * 0.5);
      pointsToUse = Math.min(profile.points_balance, maxPoints);
    }
    
    const finalPrice = event.price - pointsToUse;
    
    const itemDetails = [{
      id: event.id.substring(0, 10),
      price: event.price,
      quantity: 1,
      name: `Event: ${event.title.substring(0, 30)}`
    }];
    
    if (pointsToUse > 0) {
      itemDetails.push({
        id: "POINTS-DISCOUNT",
        price: -pointsToUse,
        quantity: 1,
        name: "Diskon Poin YukMainBola"
      });
    }

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: finalPrice
      },
      item_details: itemDetails,
      customer_details: {
        first_name: profile?.full_name || "Member",
        email: user.email,
        phone: profile?.phone || ""
      }
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      const token = transaction.token;

      // Save token and orderId to participant
      await supabase
        .from("event_participants")
        .update({ 
          snap_token: token,
          order_id: orderId 
        })
        .eq("id", participant.id);

      // Deduct points if used
      if (pointsToUse > 0) {
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.SUPABASE_SERVICE_ROLE_KEY || ''
        );
        
        await supabaseAdmin
          .from("profiles")
          .update({ points_balance: profile!.points_balance! - pointsToUse })
          .eq("id", user.id);
          
        await supabaseAdmin
          .from("point_transactions")
          .insert({
            user_id: user.id,
            amount: -pointsToUse,
            type: "redeemed",
            reference_id: orderId,
            description: "Redeemed for Event registration"
          });
      }

      revalidatePath(`/event/${eventId}`);
      
      return { 
        success: true, 
        message: "Lanjutkan ke pembayaran.", 
        token 
      };
    } catch (midtransError) {
      console.error("Midtrans Error:", midtransError);
      // Rollback participant if payment gateway fails
      await supabase.from("event_participants").delete().eq("id", participant.id);
      return { success: false, message: "Gagal membuat sesi pembayaran." };
    }
    
  } catch (err) {
    console.error("Unexpected event registration error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function cancelEventRegistration(participantId: string) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    const { data: participant, error: fetchError } = await supabase
      .from("event_participants")
      .select("event_id, status")
      .eq("id", participantId)
      .single();
      
    if (fetchError || !participant) {
      return { success: false, message: "Data registrasi tidak ditemukan." };
    }
    
    if (participant.status === "cancelled") {
      return { success: false, message: "Registrasi sudah dibatalkan sebelumnya." };
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Update status using Admin client to bypass RLS trigger restrictions on events table
    const { error: updateError } = await supabaseAdmin
      .from("event_participants")
      .update({ status: "cancelled" })
      .eq("id", participantId);

    if (updateError) {
      console.error("Cancel error:", updateError);
      return { success: false, message: "Gagal membatalkan pendaftaran event." };
    }

    // Revalidate
    revalidatePath(`/event/${participant.event_id}`);
    revalidatePath("/profil");
    
    return { success: true, message: "Pendaftaran event berhasil dibatalkan." };
    
  } catch (err) {
    console.error("Unexpected event cancel error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
