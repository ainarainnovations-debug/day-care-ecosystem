-- Check if data was actually created
SELECT 'CHILDREN COUNT:' as info, COUNT(*) as count FROM children
UNION ALL
SELECT 'ATTENDANCE TODAY:', COUNT(*) FROM attendance WHERE date = CURRENT_DATE;

-- Show actual children data
SELECT '=== CHILDREN DATA ===' as info;
SELECT id, name, date_of_birth, parent_id FROM children;

-- Show actual attendance data  
SELECT '=== ATTENDANCE DATA ===' as info;
SELECT a.id, a.child_id, a.provider_id, a.date, a.check_in_time,
       c.name as child_name
FROM attendance a
LEFT JOIN children c ON a.child_id = c.id
WHERE a.date = CURRENT_DATE;
