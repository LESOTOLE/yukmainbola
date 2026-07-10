-- Phase 4: Events & Tournaments Schema

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
    max_participants INT NOT NULL CHECK (max_participants > 0),
    current_participants INT NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'expired')),
    snap_token TEXT,
    order_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Trigger to update current_participants on events
CREATE OR REPLACE FUNCTION handle_event_participant_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
        UPDATE public.events SET current_participants = current_participants + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
            UPDATE public.events SET current_participants = current_participants - 1 WHERE id = NEW.event_id;
        ELSIF OLD.status = 'cancelled' AND NEW.status = 'registered' THEN
            UPDATE public.events SET current_participants = current_participants + 1 WHERE id = NEW.event_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
        UPDATE public.events SET current_participants = current_participants - 1 WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_event_participant_change
    AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
    FOR EACH ROW EXECUTE FUNCTION handle_event_participant_change();

-- RLS Policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY events_select_public ON public.events FOR SELECT USING (true);
CREATE POLICY events_all_admin ON public.events FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

CREATE POLICY event_participants_select_own ON public.event_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY event_participants_insert_own ON public.event_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY event_participants_update_own ON public.event_participants FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY event_participants_all_admin ON public.event_participants FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
