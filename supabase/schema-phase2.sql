-- ============================================
-- Yuk Main Bola — Phase 2 Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- Table: bookings
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Ensure a user can only have one active booking per schedule
  UNIQUE (schedule_id, user_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Bookings RLS policies
CREATE POLICY "bookings_select_public" ON public.bookings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    -- Only allow changing status, prevent changing schedule_id or user_id
    AND schedule_id = (SELECT schedule_id FROM public.bookings WHERE id = bookings.id)
    AND user_id = (SELECT user_id FROM public.bookings WHERE id = bookings.id)
  );

CREATE POLICY "bookings_admin_all" ON public.bookings
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- Triggers for Booking Count & Status
-- ============================================

-- Update updated_at
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Function to handle booking count changes
CREATE OR REPLACE FUNCTION public.handle_booking_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_players INT;
  v_current_players INT;
BEGIN
  -- Handle new booking
  IF TG_OP = 'INSERT' AND NEW.status = 'booked' THEN
    -- Get schedule limits
    SELECT max_players, current_players INTO v_max_players, v_current_players
    FROM public.schedules WHERE id = NEW.schedule_id FOR UPDATE;
    
    -- Check capacity
    IF v_current_players >= v_max_players THEN
      RAISE EXCEPTION 'Jadwal sudah penuh!';
    END IF;

    -- Increment players
    UPDATE public.schedules 
    SET current_players = current_players + 1,
        status = CASE WHEN current_players + 1 >= max_players THEN 'full' ELSE 'open' END
    WHERE id = NEW.schedule_id;
  
  -- Handle status change to cancelled
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'booked' AND NEW.status = 'cancelled' THEN
    -- Decrement players
    UPDATE public.schedules 
    SET current_players = GREATEST(0, current_players - 1),
        status = CASE WHEN status = 'full' THEN 'open' ELSE status END
    WHERE id = NEW.schedule_id;
    
  -- Handle status change from cancelled back to booked
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'cancelled' AND NEW.status = 'booked' THEN
    -- Get schedule limits
    SELECT max_players, current_players INTO v_max_players, v_current_players
    FROM public.schedules WHERE id = NEW.schedule_id FOR UPDATE;
    
    IF v_current_players >= v_max_players THEN
      RAISE EXCEPTION 'Jadwal sudah penuh!';
    END IF;

    UPDATE public.schedules 
    SET current_players = current_players + 1,
        status = CASE WHEN current_players + 1 >= max_players THEN 'full' ELSE 'open' END
    WHERE id = NEW.schedule_id;
    
  -- Handle hard delete
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'booked' THEN
    UPDATE public.schedules 
    SET current_players = GREATEST(0, current_players - 1),
        status = CASE WHEN status = 'full' THEN 'open' ELSE status END
    WHERE id = OLD.schedule_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_booking_change();
