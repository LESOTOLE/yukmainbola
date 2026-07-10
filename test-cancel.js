global.WebSocket = require('ws');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testCancel() {
  const { data: { session }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'member@yukmainbola.id',
    password: 'Member123!'
  });
  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  
  const { data: bookings, error: listError } = await supabase.from('bookings').select('*').limit(1);
  if (listError) {
    console.error("List error:", listError);
    return;
  }
  if (!bookings || bookings.length === 0) {
    console.log("No bookings found to test. Trying to create one...");
    // Let's find a schedule
    const { data: schedule } = await supabase.from('schedules').select('*').limit(1).single();
    if (!schedule) {
      console.log("No schedule found either.");
      return;
    }
    const { data: newBooking, error: insertError } = await supabase.from('bookings').insert({
      schedule_id: schedule.id,
      user_id: session.user.id,
      status: 'booked'
    }).select().single();
    if (insertError) {
      console.error("Insert error:", insertError);
      return;
    }
    bookings.push(newBooking);
  }
  
  const booking = bookings[0];
  console.log("Trying to cancel booking:", booking.id);
  
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking.id);
    
  if (updateError) {
    console.error("UPDATE ERROR =>", updateError);
  } else {
    console.log("Update success!");
    // Revert it back for testing
    await supabase.from('bookings').update({ status: 'booked' }).eq('id', booking.id);
  }
}

testCancel();
