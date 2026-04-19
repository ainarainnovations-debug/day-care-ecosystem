-- Quick Database Check - Run this to verify seed data was created
-- Copy and paste this into Supabase SQL Editor

-- First, let's see what tables actually exist
SELECT 'AVAILABLE TABLES:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

SELECT '==========================================';
SELECT 'DATA COUNTS:' as info;
SELECT '==========================================';

-- Check only core tables that definitely should exist
DO $$
DECLARE
  table_exists boolean;
BEGIN
  -- Classrooms
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classrooms') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'CLASSROOMS: %', (SELECT COUNT(*) FROM classrooms);
  ELSE
    RAISE NOTICE 'CLASSROOMS: table does not exist';
  END IF;

  -- Children
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'children') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'CHILDREN: %', (SELECT COUNT(*) FROM children);
  ELSE
    RAISE NOTICE 'CHILDREN: table does not exist';
  END IF;

  -- Attendance
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'ATTENDANCE (today): %', (SELECT COUNT(*) FROM attendance WHERE date = CURRENT_DATE);
  ELSE
    RAISE NOTICE 'ATTENDANCE: table does not exist';
  END IF;

  -- Bookings
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'BOOKINGS: %', (SELECT COUNT(*) FROM bookings);
  ELSE
    RAISE NOTICE 'BOOKINGS: table does not exist';
  END IF;

  -- Invoices
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'INVOICES: %', (SELECT COUNT(*) FROM invoices);
  ELSE
    RAISE NOTICE 'INVOICES: table does not exist';
  END IF;

  -- Waitlist
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'waitlist') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'WAITLIST: %', (SELECT COUNT(*) FROM waitlist);
  ELSE
    RAISE NOTICE 'WAITLIST: table does not exist';
  END IF;

  -- Profiles
  SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') INTO table_exists;
  IF table_exists THEN
    RAISE NOTICE 'PROFILES: %', (SELECT COUNT(*) FROM profiles);
  ELSE
    RAISE NOTICE 'PROFILES: table does not exist';
  END IF;
END $$;

-- Show provider info
SELECT '==========================================';
SELECT 'PROVIDER ACCOUNT INFO:' as info;
SELECT '==========================================';

SELECT id, display_name, role 
FROM profiles 
WHERE role = 'provider' 
LIMIT 1;

-- Show all profiles to see what exists
SELECT '==========================================';
SELECT 'ALL PROFILES:' as info;
SELECT '==========================================';

SELECT p.id, p.display_name, p.role, p.created_at, u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
