-- Check provider user ID match
SELECT 'Provider in auth.users:' as info;
SELECT id, email FROM auth.users WHERE email = 'nonololy509@gmail.com';

SELECT 'Provider ID used in attendance:' as info;
SELECT DISTINCT provider_id FROM attendance;

SELECT 'Do they match?' as info;
SELECT 
  CASE 
    WHEN (SELECT id FROM auth.users WHERE email = 'nonololy509@gmail.com') = (SELECT DISTINCT provider_id FROM attendance LIMIT 1)
    THEN '✅ YES - IDs match!'
    ELSE '❌ NO - IDs do not match'
  END as result;
