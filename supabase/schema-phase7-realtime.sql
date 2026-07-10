-- Phase 7: Real-time Updates

-- Enable REPLICA IDENTITY FULL for both tables to send full rows on UPDATE
ALTER TABLE public.schedules REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
-- This enables them for realtime subscriptions via the client
BEGIN;
  DO $$
  BEGIN
    -- For schedules
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'schedules'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
    END IF;
    
    -- For events
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'events'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
    END IF;
  END $$;
COMMIT;
