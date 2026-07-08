-- ============================================
-- Yuk Main Bola — Phase 1 Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- Seed Venues (2 venues)
INSERT INTO public.venues (id, name, address, maps_url, image_url, facilities) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Lapangan Minisoccer Senayan',
  'Jl. Asia Afrika, Gelora, Tanah Abang, Jakarta Pusat 10270',
  'https://maps.google.com/?q=-6.2188,106.8022',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
  '["parkir", "toilet", "kantin", "mushola", "tribun"]'::jsonb
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  'Green Field Arena Kemang',
  'Jl. Kemang Raya No. 45, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
  'https://maps.google.com/?q=-6.2600,106.8133',
  'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
  '["parkir", "toilet", "kantin", "ruang ganti"]'::jsonb
);

-- Seed Schedules (5 schedules — use future dates)
INSERT INTO public.schedules (venue_id, date, start_time, end_time, max_players, current_players, price_per_person, status) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  CURRENT_DATE + INTERVAL '2 days',
  '19:00', '21:00', 20, 14,
  75000, 'open'
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  CURRENT_DATE + INTERVAL '3 days',
  '20:00', '22:00', 16, 16,
  80000, 'full'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  CURRENT_DATE + INTERVAL '5 days',
  '18:00', '20:00', 20, 8,
  75000, 'open'
),
(
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  CURRENT_DATE + INTERVAL '7 days',
  '19:00', '21:00', 16, 0,
  85000, 'open'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  CURRENT_DATE - INTERVAL '7 days',
  '19:00', '21:00', 20, 20,
  75000, 'completed'
);

-- Seed Gallery (6 images)
INSERT INTO public.gallery (image_url, caption) VALUES
('https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800', 'Mabar seru Sabtu malam di Senayan'),
('https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800', 'Gol terakhir yang menentukan!'),
('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800', 'Tim juara turnamen minisoccer 2026'),
('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800', 'Pemanasan sebelum kick-off'),
('https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800', 'Selebrasi gol spektakuler'),
('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800', 'Suasana lapangan malam hari');

-- Seed Testimonials (4 testimonials)
-- Note: These require existing profile IDs. For demo, we'll create placeholder profiles first.
-- In production, testimonials are created by actual registered users.

-- For seed, we need to insert auth users first via Supabase Dashboard or use a workaround.
-- Alternative: Insert profiles directly for demo (won't have auth.users reference in dev)
-- We'll skip testimonial seeding here — admin can add them via dashboard after creating test users.

-- If you have test users created via Supabase Auth, update the user_ids below:
-- INSERT INTO public.testimonials (user_id, content, rating) VALUES
-- ('<user-id-1>', 'Komunitasnya asik banget! Tiap minggu pasti mabar. Recommended!', 5),
-- ('<user-id-2>', 'Lapangannya bagus, well-maintained. Senang bisa gabung.', 4),
-- ('<user-id-3>', 'Pertama kali ikut minisoccer di sini, langsung ketagihan!', 5),
-- ('<user-id-4>', 'Harga terjangkau, teman-teman juga ramah. Mantap!', 4);
