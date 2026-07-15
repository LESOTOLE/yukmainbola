-- ============================================
-- Yuk Main Bola — Phase 9: Group Booking
-- Run this in Supabase SQL Editor
-- ============================================
-- Adds support for booking multiple slots at once.
-- A member can register individually (quantity=1) or
-- bring friends (quantity=N) with optional guest names.
-- ============================================

-- ============================================
-- Step 1: Add new columns to bookings
-- ============================================
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1
    CHECK (quantity >= 1 AND quantity <= 20),
  ADD COLUMN IF NOT EXISTS guest_names JSONB DEFAULT '[]'::jsonb;

-- COMMENT: quantity = jumlah slot yang dibooking (termasuk pemesan sendiri)
-- COMMENT: guest_names = array nama-nama teman, e.g. ["Andi", "Budi"]
--          panjang array harus = quantity - 1 (divalidasi di level aplikasi)

-- ============================================
-- Step 2: Replace UNIQUE constraint
-- ============================================
-- Drop the old unique constraint that prevents one user
-- from having more than one booking per schedule.
-- We replace it with a partial unique index that only
-- blocks duplicate ACTIVE (non-cancelled) bookings.
-- This allows a user to re-book after cancellation.
-- ============================================
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_schedule_id_user_id_key;

-- Prevent duplicate active bookings (user can only have 1 active booking per schedule)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_active_per_user
  ON public.bookings (schedule_id, user_id)
  WHERE status = 'booked';

-- ============================================
-- Step 3: Update the booking trigger function
-- ============================================
-- The trigger now uses NEW.quantity / OLD.quantity
-- instead of hardcoded +1 / -1.
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_booking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_players INT;
  v_current_players INT;
  v_qty INT;
BEGIN
  -- Handle new booking
  IF TG_OP = 'INSERT' AND NEW.status = 'booked' THEN
    v_qty := COALESCE(NEW.quantity, 1);

    -- Get schedule limits (lock the row to prevent race conditions)
    SELECT max_players, current_players INTO v_max_players, v_current_players
    FROM public.schedules WHERE id = NEW.schedule_id FOR UPDATE;

    -- Check capacity
    IF v_current_players + v_qty > v_max_players THEN
      RAISE EXCEPTION 'Slot tidak cukup! Sisa slot: %, diminta: %',
        (v_max_players - v_current_players), v_qty;
    END IF;

    -- Increment players by quantity
    UPDATE public.schedules
    SET current_players = current_players + v_qty,
        status = CASE WHEN current_players + v_qty >= max_players THEN 'full' ELSE 'open' END
    WHERE id = NEW.schedule_id;

  -- Handle status change to cancelled
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'booked' AND NEW.status = 'cancelled' THEN
    v_qty := COALESCE(OLD.quantity, 1);

    -- Decrement players by quantity
    UPDATE public.schedules
    SET current_players = GREATEST(0, current_players - v_qty),
        status = CASE WHEN status = 'full' THEN 'open' ELSE status END
    WHERE id = NEW.schedule_id;

  -- Handle status change from cancelled back to booked
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'cancelled' AND NEW.status = 'booked' THEN
    v_qty := COALESCE(NEW.quantity, 1);

    -- Get schedule limits
    SELECT max_players, current_players INTO v_max_players, v_current_players
    FROM public.schedules WHERE id = NEW.schedule_id FOR UPDATE;

    IF v_current_players + v_qty > v_max_players THEN
      RAISE EXCEPTION 'Slot tidak cukup! Sisa slot: %, diminta: %',
        (v_max_players - v_current_players), v_qty;
    END IF;

    UPDATE public.schedules
    SET current_players = current_players + v_qty,
        status = CASE WHEN current_players + v_qty >= max_players THEN 'full' ELSE 'open' END
    WHERE id = NEW.schedule_id;

  -- Handle hard delete
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'booked' THEN
    v_qty := COALESCE(OLD.quantity, 1);

    UPDATE public.schedules
    SET current_players = GREATEST(0, current_players - v_qty),
        status = CASE WHEN status = 'full' THEN 'open' ELSE status END
    WHERE id = OLD.schedule_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

-- Note: The trigger itself (on_booking_change) does NOT need to be recreated.
-- CREATE OR REPLACE FUNCTION replaces the function body in-place,
-- and the existing trigger automatically uses the updated function.
