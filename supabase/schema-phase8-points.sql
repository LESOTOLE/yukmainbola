-- Loyalty Points Database Schema Updates
-- Run this in Supabase SQL Editor

-- 1. Add points_balance to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0;

-- 2. Create point_transactions table
CREATE TABLE IF NOT EXISTS public.point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'refunded')),
    reference_id TEXT, -- The order_id or booking/event ID this is related to
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on point_transactions
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for point_transactions
-- Users can read their own transactions
CREATE POLICY point_transactions_select_own ON public.point_transactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Only service role (admin) can insert or update transactions
-- We don't create policies for INSERT/UPDATE because they will be done via supabaseAdmin
