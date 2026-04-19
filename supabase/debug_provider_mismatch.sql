-- Debug Provider Mismatch - Find out which provider owns the data
-- Run this in Supabase SQL Editor

-- 1. Show the provider that seed script found and used
SELECT 'PROVIDER USED BY SEED SCRIPT:' as info;
SELECT p.id as profile_id, p.display_name, p.role, u.id as user_id, u.email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'provider'
LIMIT 1;

-- 2. Check if children table has any data
SELECT '==========================================';
SELECT 'CHILDREN TABLE DATA:' as info;
SELECT COUNT(*) as total_children FROM children;

-- 3. Show sample children data (actual columns)
SELECT id, name, date_of_birth, parent_id, created_at
FROM children
LIMIT 5;

-- 4. Check attendance table
SELECT '==========================================';
SELECT 'ATTENDANCE TABLE DATA:' as info;
SELECT COUNT(*) as total_attendance FROM attendance;
SELECT COUNT(*) as today_attendance FROM attendance WHERE date = CURRENT_DATE;

-- 5. Check classrooms table
SELECT '==========================================';
SELECT 'CLASSROOMS TABLE DATA:' as info;
SELECT COUNT(*) as total_classrooms FROM classrooms;

-- 6. Check invoices table  
SELECT '==========================================';
SELECT 'INVOICES TABLE DATA:' as info;
SELECT COUNT(*) as total_invoices FROM invoices;

-- 7. Show what columns children table actually has
SELECT '==========================================';
SELECT 'CHILDREN TABLE COLUMNS:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'children'
ORDER BY ordinal_position;
