-- ============================================================
-- HealthAI Prototype — Migration: Add role column to profiles
-- ============================================================
-- Review carefully before executing in Supabase SQL Editor.
-- DO NOT AUTO-RUN.
-- ============================================================

-- 1. Ensure UserRole enum type exists if not already present
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('PATIENT', 'ADMIN', 'DOCTOR');
    END IF;
END
$$;

-- 2. Add role column to profiles table with default 'PATIENT'
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'PATIENT';

-- 3. Backfill existing profile roles from corresponding users table
UPDATE public.profiles p
SET role = u.role
FROM public.users u
WHERE p.user_id = u.id;
