-- =====================================================
-- CREATE ADMIN USER: acerneau.97@gmail.com
-- =====================================================
-- Run this SQL in Supabase SQL Editor after creating the user
-- Dashboard: https://supabase.com/dashboard/project/chsymveauapcrxywrsii/sql

-- STEP 1: First, create the auth user via Supabase Dashboard
-- Go to: Authentication > Users > Add User
-- Email: acerneau.97@gmail.com
-- Password: test1234
-- Auto Confirm User: YES (check this box)

-- STEP 2: Then run this SQL to set admin role
-- This will update the profile to admin role
UPDATE profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'acerneau.97@gmail.com';

-- Verify the admin user was created
SELECT id, email, role, display_name, created_at
FROM profiles
WHERE email = 'acerneau.97@gmail.com';

-- If no profile exists yet, create it manually:
-- (Replace 'USER_ID_HERE' with the actual UUID from auth.users)
/*
INSERT INTO profiles (id, email, role, display_name, created_at, updated_at)
SELECT 
  id,
  email,
  'admin',
  'Admin User',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'acerneau.97@gmail.com'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();
*/

