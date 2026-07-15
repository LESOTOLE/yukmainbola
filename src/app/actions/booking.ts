"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { snap } from "@/lib/midtrans";

export async function joinMabar(
  scheduleId: string,
  quantity: number = 1,
  guestNames: string[] = [],
  usePoints: boolean = false
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, message: "Silakan login terlebih dahulu untuk bergabung." };
    }

    // Get user profile for payment details and points
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, points_balance")
      .eq("id", user.id)
      .single();

    // Get schedule details for payment amount
    const { data: schedule } = await supabase
      .from("schedules")
      .select("*, venues(name)")
      .eq("id", scheduleId)
      .single();

    if (!schedule) {
      return { success: false, message: "Jadwal tidak ditemukan." };
    }

    // Validate quantity
    const qty = Math.max(1, Math.min(20, Math.floor(quantity)));
    const availableSlots = schedule.max_players - schedule.current_players;

    if (availableSlots <= 0) {
      return { success: false, message: "Maaf, kuota untuk jadwal ini sudah penuh." };
    }

    if (qty > availableSlots) {
      return { success: false, message: `Slot tidak cukup. Sisa slot tersedia: ${availableSlots}.` };
    }

    // Validate guest names: should have exactly (qty - 1) names if qty > 1
    const cleanedGuestNames = guestNames
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .slice(0, qty - 1);

    // Insert booking with quantity and guest names
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        schedule_id: scheduleId,
        user_id: user.id,
        status: "booked",
        payment_status: "pending",
        quantity: qty,
        guest_names: cleanedGuestNames
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return { success: false, message: "Anda sudah terdaftar di jadwal ini." };
      }
      if (insertError.message.includes("Slot tidak cukup") || insertError.message.includes("Jadwal sudah penuh")) {
        return { success: false, message: "Maaf, slot tidak mencukupi untuk jumlah yang diminta." };
      }
      console.error("Booking error:", insertError);
      return { success: false, message: "Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi." };
    }

    const venueName = Array.isArray(schedule.venues) ? schedule.venues[0]?.name : schedule.venues?.name;
    const orderId = `YMB-${booking.id.split('-')[0]}-${Date.now()}`;
    
    // Calculate total price based on quantity
    const totalPrice = schedule.price_per_person * qty;

    // Calculate points to use (max 50% of total price)
    let pointsToUse = 0;
    if (usePoints && profile?.points_balance && profile.points_balance > 0) {
      const maxPoints = Math.floor(totalPrice * 0.5);
      pointsToUse = Math.min(profile.points_balance, maxPoints);
    }
    
    const finalPrice = totalPrice - pointsToUse;
    
    const itemDetails = [{
      id: schedule.id.substring(0, 10),
      price: schedule.price_per_person,
      quantity: qty,
      name: `Mabar di ${venueName || 'Venue'}${qty > 1 ? ` (${qty} orang)` : ''}`
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

      // Save token and orderId to booking
      await supabase
        .from("bookings")
        .update({ 
          snap_token: token,
          order_id: orderId 
        })
        .eq("id", booking.id);

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
            description: "Redeemed for Mabar booking"
          });
      }

      revalidatePath(`/jadwal/${scheduleId}`);
      
      return { 
        success: true, 
        message: "Lanjutkan ke pembayaran.", 
        token 
      };
    } catch (midtransError) {
      console.error("Midtrans Error:", midtransError);
      // Rollback booking if payment gateway fails
      await supabase.from("bookings").delete().eq("id", booking.id);
      return { success: false, message: "Gagal membuat sesi pembayaran." };
    }
    
  } catch (err) {
    console.error("Unexpected booking error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}

export async function cancelBooking(bookingId: string) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, message: "Silakan login terlebih dahulu." };
    }

    // Only allow updating own booking via RLS
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("schedule_id, status")
      .eq("id", bookingId)
      .single();
      
    if (fetchError || !booking) {
      return { success: false, message: "Data booking tidak ditemukan." };
    }
    
    if (booking.status === "cancelled") {
      return { success: false, message: "Booking sudah dibatalkan sebelumnya." };
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Update status using Admin client to bypass RLS infinite recursion bug
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Cancel error:", updateError);
      return { success: false, message: "Gagal membatalkan pendaftaran." };
    }

    // Revalidate
    revalidatePath(`/jadwal/${booking.schedule_id}`);
    revalidatePath("/profil");
    
    return { success: true, message: "Pendaftaran berhasil dibatalkan." };
    
  } catch (err) {
    console.error("Unexpected cancel error:", err);
    return { success: false, message: "Terjadi kesalahan sistem." };
  }
}
