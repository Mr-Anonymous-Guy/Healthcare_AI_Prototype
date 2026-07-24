-- ========================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES — AUTH & PROFILES
-- File: supabase/policies/01_auth_rls.sql
-- Status: Reviewable file ONLY. Do not execute automatically.
-- ========================================================

-- Enable RLS on users and profiles tables
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- POLICIES FOR 'users' TABLE
-- --------------------------------------------------------

-- 1. Patients can view their own user account record
CREATE POLICY "Users: Select own record" ON "public"."users"
    FOR SELECT
    USING (auth.uid() = id);

-- 2. Patients can update their own user account record
CREATE POLICY "Users: Update own record" ON "public"."users"
    FOR UPDATE
    USING (auth.uid() = id);

-- 3. Admins can view all user account records
CREATE POLICY "Users: Admin select all" ON "public"."users"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "public"."users" u
            WHERE u.id = auth.uid() AND u.role = 'ADMIN'
        )
    );

-- 4. Admins can update any user account record
CREATE POLICY "Users: Admin update all" ON "public"."users"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "public"."users" u
            WHERE u.id = auth.uid() AND u.role = 'ADMIN'
        )
    );

-- --------------------------------------------------------
-- POLICIES FOR 'profiles' TABLE
-- --------------------------------------------------------

-- 1. Patients can view their own profile details
CREATE POLICY "Profiles: Select own profile" ON "public"."profiles"
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Patients can update their own profile details
CREATE POLICY "Profiles: Update own profile" ON "public"."profiles"
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Patients can insert their own profile details
CREATE POLICY "Profiles: Insert own profile" ON "public"."profiles"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Admins can view all user profiles
CREATE POLICY "Profiles: Admin select all" ON "public"."profiles"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "public"."users" u
            WHERE u.id = auth.uid() AND u.role = 'ADMIN'
        )
    );
