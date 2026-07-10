-- ============================================
-- Yuk Main Bola — Phase 3 Database Schema (Midtrans Payment)
-- Run this in Supabase SQL Editor
-- ============================================

-- Add payment columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
  ADD COLUMN snap_token TEXT,
  ADD COLUMN order_id TEXT UNIQUE,
  ADD COLUMN snap_redirect_url TEXT;

-- Update RLS for bookings to allow users to see their payment status
-- (No change needed as users can already select their own bookings, we just added columns)

-- Update the types in Supabase (if generated via CLI later)

-- Notice:
-- Our previous trigger (on_booking_change) will still work exactly the same!
-- When a user clicks "Join Mabar", we INSERT a booking with status = 'booked' and payment_status = 'pending'.
-- The trigger will IMMEDIATELY increment current_players (reserving the slot).
-- If the payment expires or fails, our Webhook will UPDATE the booking status to 'cancelled'.
-- The trigger will then DECREMENT current_players (freeing the slot).
