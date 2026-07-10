-- ============================================
-- Yuk Main Bola — Dummy Venue (Jakarta Selatan) & Jadwal
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Insert a Minisoccer Venue in Jakarta Selatan
INSERT INTO public.venues (id, name, address, maps_url, image_url, facilities)
VALUES (
    'a8c1d4e7-9b2f-4a3d-b5c6-7d8e9f0a1b2c',
    'Pancoran Soccer Field (PSF)',
    'Jl. Gatot Subroto No.72, Pancoran, Kec. Pancoran, Jakarta Selatan 12780',
    'https://maps.google.com/?q=-6.2418,106.8407',
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
    '["parkir luas", "toilet bersih", "kantin", "ruang ganti VIP", "tribun penonton"]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert 3 Upcoming Schedules for this Venue
INSERT INTO public.schedules (venue_id, date, start_time, end_time, max_players, current_players, price_per_person, status)
VALUES
(
    'a8c1d4e7-9b2f-4a3d-b5c6-7d8e9f0a1b2c',
    CURRENT_DATE + INTERVAL '1 day',
    '19:00', '21:00', 
    24, 12, 
    85000, 'open'
),
(
    'a8c1d4e7-9b2f-4a3d-b5c6-7d8e9f0a1b2c',
    CURRENT_DATE + INTERVAL '2 days',
    '20:00', '22:00', 
    20, 20, 
    85000, 'full' -- fully booked so you can see the UI difference
),
(
    'a8c1d4e7-9b2f-4a3d-b5c6-7d8e9f0a1b2c',
    CURRENT_DATE + INTERVAL '4 days',
    '16:00', '18:00', 
    24, 5, 
    70000, 'open' -- cheaper afternoon slot
);
