-- ============================================
-- Yuk Main Bola — Seed Dummy Users & Testimonials
-- Jalankan ini di SQL Editor Supabase Dashboard
-- ============================================

-- Aktifkan ekstensi pgcrypto (biasanya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Buat Dummy Admin (Password: Admin123!)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'admin@yukmainbola.id',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Admin Utama", "phone": "081111111111"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Set role profile menjadi admin (karena trigger otomatis membuatkannya sebagai 'member')
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- 2. Buat Dummy Member (Password: Member123!)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'member@yukmainbola.id',
  crypt('Member123!', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "Member Setia", "phone": "082222222222"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Masukkan Testimonial Dummy untuk Member
INSERT INTO public.testimonials (id, user_id, content, rating)
VALUES 
(
  '33333333-3333-3333-3333-333333333333', 
  '22222222-2222-2222-2222-222222222222', 
  'Komunitasnya seru banget! Main bareng rutin setiap akhir pekan, harganya juga sangat terjangkau. Sangat direkomendasikan untuk pemula!', 
  5
) ON CONFLICT (id) DO NOTHING;
