-- ============================================
-- Yuk Main Bola — Dummy Jadwal & Event Data
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Ensure we have a dummy venue
INSERT INTO public.venues (id, name, address, maps_url, image_url, facilities)
VALUES (
    'f9b9f5e1-5b72-4d53-a5c8-111122223333',
    'Gelora Mabar Arena',
    'Jl. Dummy Football No 10, Jakarta',
    'https://maps.google.com',
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
    '["parkir", "toilet", "kantin"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert 2 upcoming Schedules (Jadwal Mabar)
INSERT INTO public.schedules (venue_id, date, start_time, end_time, max_players, current_players, price_per_person, status)
VALUES
(
    'f9b9f5e1-5b72-4d53-a5c8-111122223333',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00', '21:00', 
    20, 5, 
    75000, 'open'
),
(
    'f9b9f5e1-5b72-4d53-a5c8-111122223333',
    CURRENT_DATE + INTERVAL '3 days',
    '20:00', '22:00', 
    16, 2, 
    80000, 'open'
);

-- 3. Insert 1 upcoming Event/Turnamen
INSERT INTO public.events (title, description, venue_id, date, start_time, end_time, price, max_participants, current_participants, status)
VALUES
(
    'Turnamen Minisoccer Kemerdekaan',
    'Turnamen seru menyambut hari kemerdekaan! Dapatkan hadiah menarik untuk juara 1, 2, dan 3.',
    'f9b9f5e1-5b72-4d53-a5c8-111122223333',
    CURRENT_DATE + INTERVAL '14 days',
    '08:00', '18:00',
    150000, 32, 10, 'upcoming'
);
