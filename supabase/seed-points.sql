-- Seed dummy loyalty points for all users
-- Run this in your Supabase SQL Editor to give everyone some starting points

-- 1. Give 50,000 points to every user
UPDATE public.profiles
SET points_balance = 50000;

-- 2. Insert a dummy 'earned' transaction history for every user
INSERT INTO public.point_transactions (user_id, amount, type, reference_id, description, created_at)
SELECT 
    id as user_id, 
    50000 as amount, 
    'earned' as type, 
    'SYSTEM-GIFT' as reference_id, 
    'Bonus pendaftaran awal' as description, 
    NOW() as created_at
FROM public.profiles;
