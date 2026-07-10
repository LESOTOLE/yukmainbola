-- ============================================
-- Yuk Main Bola — Phase 1 Database Schema
-- Run this in Supabase SQL Editor
-- ============================================



-- ============================================
-- Table: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('super_admin', 'admin', 'member', 'guest')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_super" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.get_user_role() = 'super_admin');

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Member'),
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Table: venues
-- ============================================
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  maps_url TEXT,
  image_url TEXT,
  facilities JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "venues_select_public" ON public.venues
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "venues_insert_admin" ON public.venues
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "venues_update_admin" ON public.venues
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "venues_delete_admin" ON public.venues
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- Table: schedules
-- ============================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_players INT NOT NULL CHECK (max_players > 0),
  current_players INT NOT NULL DEFAULT 0 CHECK (current_players >= 0),
  price_per_person DECIMAL(10,2) NOT NULL CHECK (price_per_person >= 0),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_public" ON public.schedules
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "schedules_insert_admin" ON public.schedules
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "schedules_update_admin" ON public.schedules
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "schedules_delete_admin" ON public.schedules
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- Table: gallery
-- ============================================
CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gallery_select_public" ON public.gallery
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_insert_admin" ON public.gallery
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "gallery_update_admin" ON public.gallery
  FOR UPDATE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

CREATE POLICY "gallery_delete_admin" ON public.gallery
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));

-- ============================================
-- Table: testimonials
-- ============================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "testimonials_select_public" ON public.testimonials
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "testimonials_insert_member" ON public.testimonials
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "testimonials_update_own" ON public.testimonials
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "testimonials_delete_admin" ON public.testimonials
  FOR DELETE TO authenticated
  USING (public.get_user_role() IN ('admin', 'super_admin'));
