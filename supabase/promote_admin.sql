-- ============================================================
-- HealthAI Prototype — One-Time Manual Admin Promotion Script
-- ============================================================
-- Run this query manually in Supabase SQL Editor to promote
-- the initial admin user.
-- ============================================================

UPDATE public.users 
SET role = 'ADMIN', updated_at = NOW()
WHERE email = 'rishovmahapatra@gmail.com';

UPDATE public.profiles 
SET role = 'ADMIN', updated_at = NOW()
WHERE user_id IN (
    SELECT id FROM public.users WHERE email = 'rishovmahapatra@gmail.com'
);
