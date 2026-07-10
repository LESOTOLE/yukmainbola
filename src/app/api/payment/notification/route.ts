import { NextResponse } from "next/server";
import { coreApi } from "@/lib/midtrans";
import { createClient } from "@supabase/supabase-js";

// Note: Initialize inside handler to avoid build errors if env var is missing
export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    const notificationJson = await req.json();

    // Verify notification authenticity using Midtrans CoreApi
    const statusResponse = await coreApi.transaction.notification(notificationJson);
    
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`[Midtrans Webhook] Order: ${orderId} | Status: ${transactionStatus} | Fraud: ${fraudStatus}`);

    let newPaymentStatus = 'pending';
    let newBookingStatus = 'booked';

    if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
      if (fraudStatus == 'challenge') {
        newPaymentStatus = 'pending';
      } else if (fraudStatus == 'accept') {
        newPaymentStatus = 'paid';
      } else {
        newPaymentStatus = 'paid';
      }
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newPaymentStatus = transactionStatus === 'expire' ? 'expired' : 'failed';
      newBookingStatus = 'cancelled'; // Release the slot
    }

    if (newPaymentStatus !== 'pending') {
      const isEvent = orderId.startsWith('EVT-');
      const table = isEvent ? "event_participants" : "bookings";
      const actualBookingStatus = isEvent && newBookingStatus === 'cancelled' ? 'cancelled' : 
                                  isEvent ? 'registered' : newBookingStatus;

      await supabaseAdmin
        .from(table)
        .update({ 
          payment_status: newPaymentStatus,
          status: actualBookingStatus
        })
        .eq("order_id", orderId);
        
      if (newPaymentStatus === 'paid') {
        // EARN POINTS (10% of gross amount)
        const pointsEarned = Math.floor(parseFloat(statusResponse.gross_amount) * 0.10);
        if (pointsEarned > 0) {
          const { data: record } = await supabaseAdmin.from(table).select('user_id').eq('order_id', orderId).single();
          if (record) {
            const { data: profile } = await supabaseAdmin.from('profiles').select('points_balance').eq('id', record.user_id).single();
            await supabaseAdmin.from('profiles').update({ points_balance: (profile?.points_balance || 0) + pointsEarned }).eq('id', record.user_id);
            await supabaseAdmin.from('point_transactions').insert({
              user_id: record.user_id,
              amount: pointsEarned,
              type: 'earned',
              reference_id: orderId,
              description: 'Points earned from booking'
            });
          }
        }
        await sendBookingConfirmationEmail(supabaseAdmin, orderId, isEvent ? 'event' : 'schedule');
      } else if (newBookingStatus === 'cancelled') {
        // REFUND POINTS if any were used
        const { data: txs } = await supabaseAdmin
          .from('point_transactions')
          .select('*')
          .eq('reference_id', orderId)
          .eq('type', 'redeemed');
        
        if (txs && txs.length > 0) {
          const tx = txs[0];
          const pointsToRefund = Math.abs(tx.amount); // redeemed amount is negative
          const { data: profile } = await supabaseAdmin.from('profiles').select('points_balance').eq('id', tx.user_id).single();
          await supabaseAdmin.from('profiles').update({ points_balance: (profile?.points_balance || 0) + pointsToRefund }).eq('id', tx.user_id);
          await supabaseAdmin.from('point_transactions').insert({
            user_id: tx.user_id,
            amount: pointsToRefund,
            type: 'refunded',
            reference_id: orderId,
            description: 'Points refunded due to cancellation/expiry'
          });
        }
      }
    }
    
    return NextResponse.json({ status: "success", message: "Notification processed" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

async function sendBookingConfirmationEmail(supabase: any, orderId: string, type: 'event' | 'schedule') {
  try {
    let userId;
    let scheduleData;
    let eventData;
    
    if (type === 'schedule') {
      const { data } = await supabase.from('bookings').select('user_id, schedules(*, venues(*))').eq('order_id', orderId).single();
      if (!data) return;
      userId = data.user_id;
      scheduleData = data.schedules;
    } else {
      const { data } = await supabase.from('event_participants').select('user_id, events(*, venues(*))').eq('order_id', orderId).single();
      if (!data) return;
      userId = data.user_id;
      eventData = data.events;
    }
    
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !userData?.user?.email) return;
    
    const userEmail = userData.user.email;
    const title = type === 'schedule' ? 'Jadwal Mabar' : 'Event';
    const venueName = type === 'schedule' ? scheduleData.venues?.name : eventData.venues?.name;
    const date = type === 'schedule' ? scheduleData.date : eventData.date;
    const time = type === 'schedule' ? `${scheduleData.start_time.substring(0,5)} - ${scheduleData.end_time.substring(0,5)}` : `${eventData.start_time.substring(0,5)} - ${eventData.end_time.substring(0,5)}`;
    
    // Here you would integrate Resend or SendGrid
    // e.g., await resend.emails.send({ ... })
    
    console.log(`\n======================================================`);
    console.log(`[MOCK EMAIL SENT] To: ${userEmail}`);
    console.log(`Subject: Booking Confirmed - ${title}`);
    console.log(`Body:`);
    console.log(`  Venue: ${venueName}`);
    console.log(`  Date: ${date}`);
    console.log(`  Time: ${time}`);
    console.log(`  Booking ID: ${orderId}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error("Failed to send mock email:", err);
  }
}
