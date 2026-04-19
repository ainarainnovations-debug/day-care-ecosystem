-- Complete Seed Data for Day Care Ecosystem
-- Run this in Supabase SQL Editor to populate test data

-- 1. First, get the provider user ID (you'll need to replace this with actual provider user_id)
-- You can find this by running: SELECT id FROM auth.users WHERE email = 'your-provider-email@example.com';

-- For this example, we'll use a variable approach
DO $$
DECLARE
  provider_user_id UUID;
  provider_profile_id UUID;
  parent1_user_id UUID;
  parent1_profile_id UUID;
  parent2_user_id UUID;
  parent2_profile_id UUID;
  parent3_user_id UUID;
  parent3_profile_id UUID;
  child1_id UUID;
  child2_id UUID;
  child3_id UUID;
  child4_id UUID;
  classroom_infants_id UUID;
  classroom_toddlers_id UUID;
  classroom_prek_id UUID;
BEGIN
  -- Get provider user (assumes you have a provider account created)
  -- If not, create one first through the UI
  SELECT id INTO provider_user_id 
  FROM auth.users 
  WHERE email LIKE '%provider%' OR role = 'provider'
  LIMIT 1;

  IF provider_user_id IS NULL THEN
    RAISE NOTICE 'No provider user found. Please create a provider account first.';
    RETURN;
  END IF;

  -- Get provider profile
  SELECT id INTO provider_profile_id
  FROM profiles
  WHERE user_id = provider_user_id;

  -- ==========================================
  -- 2. CREATE CLASSROOMS
  -- ==========================================
  
  -- Infants Classroom
  INSERT INTO classrooms (provider_id, name, age_group, licensed_capacity, current_enrollment, available_spots, description, is_active)
  VALUES (
    provider_profile_id,
    'Sunny Infants',
    'Infants (0-12 months)',
    8,
    6,
    2,
    'Nurturing care for our youngest learners',
    true
  )
  RETURNING id INTO classroom_infants_id;

  -- Toddlers Classroom
  INSERT INTO classrooms (provider_id, name, age_group, licensed_capacity, current_enrollment, available_spots, description, is_active)
  VALUES (
    provider_profile_id,
    'Happy Toddlers',
    'Toddlers (1-3 years)',
    12,
    10,
    2,
    'Active learning for curious toddlers',
    true
  )
  RETURNING id INTO classroom_toddlers_id;

  -- Pre-K Classroom
  INSERT INTO classrooms (provider_id, name, age_group, licensed_capacity, current_enrollment, available_spots, description, is_active)
  VALUES (
    provider_profile_id,
    'Bright Pre-K',
    'Pre-K (3-5 years)',
    16,
    14,
    2,
    'Kindergarten readiness program',
    true
  )
  RETURNING id INTO classroom_prek_id;

  RAISE NOTICE 'Created 3 classrooms';

  -- ==========================================
  -- 3. CREATE PARENT PROFILES (Mock - in real app these would be real users)
  -- ==========================================
  
  -- For demo purposes, we'll create profiles even without auth users
  -- In production, these would be linked to actual parent user accounts
  
  INSERT INTO profiles (user_id, role, full_name, email, phone)
  VALUES (
    gen_random_uuid(), -- Mock user_id
    'parent',
    'Sarah Johnson',
    'sarah.johnson@example.com',
    '555-0101'
  )
  RETURNING id INTO parent1_profile_id;

  INSERT INTO profiles (user_id, role, full_name, email, phone)
  VALUES (
    gen_random_uuid(),
    'parent',
    'Michael Chen',
    'michael.chen@example.com',
    '555-0102'
  )
  RETURNING id INTO parent2_profile_id;

  INSERT INTO profiles (user_id, role, full_name, email, phone)
  VALUES (
    gen_random_uuid(),
    'parent',
    'Emily Davis',
    'emily.davis@example.com',
    '555-0103'
  )
  RETURNING id INTO parent3_profile_id;

  RAISE NOTICE 'Created 3 parent profiles';

  -- ==========================================
  -- 4. CREATE CHILDREN
  -- ==========================================
  
  INSERT INTO children (parent_id, provider_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES (
    parent1_profile_id,
    provider_profile_id,
    'Emma',
    'Johnson',
    '2024-03-15', -- ~2 years old
    'None',
    'Loves painting and music time'
  )
  RETURNING id INTO child1_id;

  INSERT INTO children (parent_id, provider_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES (
    parent2_profile_id,
    provider_profile_id,
    'Noah',
    'Chen',
    '2023-06-20', -- ~3 years old
    'Dairy',
    'Very active, enjoys outdoor play'
  )
  RETURNING id INTO child2_id;

  INSERT INTO children (parent_id, provider_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES (
    parent2_profile_id,
    provider_profile_id,
    'Sophia',
    'Chen',
    '2025-01-10', -- ~1 year old
    'None',
    'Siblings with Noah'
  )
  RETURNING id INTO child3_id;

  INSERT INTO children (parent_id, provider_id, first_name, last_name, date_of_birth, allergies, notes)
  VALUES (
    parent3_profile_id,
    provider_profile_id,
    'Liam',
    'Davis',
    '2021-09-05', -- ~4 years old
    'Peanuts',
    'Enjoys reading and puzzles'
  )
  RETURNING id INTO child4_id;

  RAISE NOTICE 'Created 4 children';

  -- ==========================================
  -- 5. CREATE ATTENDANCE RECORDS (Today)
  -- ==========================================
  
  -- Emma checked in
  INSERT INTO attendance (child_id, provider_id, date, check_in_time)
  VALUES (
    child1_id,
    provider_profile_id,
    CURRENT_DATE,
    CURRENT_DATE + TIME '07:15:00'
  );

  -- Noah checked in
  INSERT INTO attendance (child_id, provider_id, date, check_in_time)
  VALUES (
    child2_id,
    provider_profile_id,
    CURRENT_DATE,
    CURRENT_DATE + TIME '07:30:00'
  );

  -- Sophia checked in
  INSERT INTO attendance (child_id, provider_id, date, check_in_time)
  VALUES (
    child3_id,
    provider_profile_id,
    CURRENT_DATE,
    CURRENT_DATE + TIME '08:00:00'
  );

  RAISE NOTICE 'Created 3 attendance records for today';

  -- ==========================================
  -- 6. CREATE BOOKINGS
  -- ==========================================
  
  -- Confirmed future booking
  INSERT INTO bookings (parent_id, provider_id, child_id, start_date, end_date, booking_type, status, total_price, notes)
  VALUES (
    parent1_profile_id,
    provider_profile_id,
    child1_id,
    CURRENT_DATE + INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '1 day',
    'full_day',
    'confirmed',
    65.00,
    'Regular booking'
  );

  -- Pending booking request
  INSERT INTO bookings (parent_id, provider_id, child_id, start_date, end_date, booking_type, status, total_price, notes)
  VALUES (
    parent3_profile_id,
    provider_profile_id,
    child4_id,
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '3 days',
    'half_day',
    'pending',
    40.00,
    'Half day morning only'
  );

  RAISE NOTICE 'Created 2 bookings';

  -- ==========================================
  -- 7. CREATE INVOICES
  -- ==========================================
  
  -- Paid invoice for Sarah
  INSERT INTO invoices (parent_id, provider_id, child_id, issue_date, due_date, total_amount, status, description)
  VALUES (
    parent1_profile_id,
    provider_profile_id,
    child1_id,
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '5 days',
    1300.00,
    'succeeded',
    'Monthly tuition - March 2026'
  );

  -- Pending invoice for Michael
  INSERT INTO invoices (parent_id, provider_id, child_id, issue_date, due_date, total_amount, status, description)
  VALUES (
    parent2_profile_id,
    provider_profile_id,
    child2_id,
    CURRENT_DATE - INTERVAL '10 days',
    CURRENT_DATE + INTERVAL '5 days',
    1300.00,
    'sent',
    'Monthly tuition - April 2026'
  );

  -- Overdue invoice for Emily
  INSERT INTO invoices (parent_id, provider_id, child_id, issue_date, due_date, total_amount, status, description)
  VALUES (
    parent3_profile_id,
    provider_profile_id,
    child4_id,
    CURRENT_DATE - INTERVAL '20 days',
    CURRENT_DATE - INTERVAL '10 days',
    650.00,
    'sent',
    'Monthly tuition - March 2026'
  );

  RAISE NOTICE 'Created 3 invoices';

  -- ==========================================
  -- 8. CREATE PAYMENT METHODS
  -- ==========================================
  
  -- Sarah - ACH with autopay
  INSERT INTO payment_methods (parent_id, provider_id, method_type, is_default, autopay_enabled, last_four, bank_name)
  VALUES (
    parent1_profile_id,
    provider_profile_id,
    'ach',
    true,
    true,
    '1234',
    'Chase Bank'
  );

  -- Michael - Card
  INSERT INTO payment_methods (parent_id, provider_id, method_type, is_default, autopay_enabled, last_four, card_brand)
  VALUES (
    parent2_profile_id,
    provider_profile_id,
    'card',
    true,
    false,
    '5678',
    'Visa'
  );

  RAISE NOTICE 'Created 2 payment methods';

  -- ==========================================
  -- 9. CREATE PAYMENTS
  -- ==========================================
  
  -- Successful ACH payment from Sarah
  INSERT INTO payments (parent_id, provider_id, invoice_id, payment_method_id, amount, net_amount, fee_amount, status, payment_date, description)
  VALUES (
    parent1_profile_id,
    provider_profile_id,
    (SELECT id FROM invoices WHERE parent_id = parent1_profile_id AND status = 'succeeded' LIMIT 1),
    (SELECT id FROM payment_methods WHERE parent_id = parent1_profile_id LIMIT 1),
    1300.00,
    1289.60,
    10.40,
    'succeeded',
    CURRENT_DATE - INTERVAL '3 days',
    'Monthly tuition payment'
  );

  RAISE NOTICE 'Created 1 payment';

  -- ==========================================
  -- 10. CREATE WAITLIST ENTRIES
  -- ==========================================
  
  INSERT INTO waitlist (provider_id, parent_name, child_name, child_age, contact_email, contact_phone, preferred_start_date, notes, position)
  VALUES (
    provider_profile_id,
    'Jessica Taylor',
    'Olivia Taylor',
    2,
    'jessica.taylor@example.com',
    '555-0201',
    CURRENT_DATE + INTERVAL '30 days',
    'Looking for toddler spot',
    1
  );

  INSERT INTO waitlist (provider_id, parent_name, child_name, child_age, contact_email, contact_phone, preferred_start_date, notes, position)
  VALUES (
    provider_profile_id,
    'David Martinez',
    'Lucas Martinez',
    1,
    'david.martinez@example.com',
    '555-0202',
    CURRENT_DATE + INTERVAL '60 days',
    'Flexible on start date',
    2
  );

  RAISE NOTICE 'Created 2 waitlist entries';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA CREATION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- 3 Classrooms (Infants, Toddlers, Pre-K)';
  RAISE NOTICE '- 3 Parent profiles';
  RAISE NOTICE '- 4 Children';
  RAISE NOTICE '- 3 Attendance records (today)';
  RAISE NOTICE '- 2 Bookings (1 confirmed, 1 pending)';
  RAISE NOTICE '- 3 Invoices (1 paid, 1 pending, 1 overdue)';
  RAISE NOTICE '- 2 Payment methods (1 ACH autopay, 1 Card)';
  RAISE NOTICE '- 1 Payment (ACH successful)';
  RAISE NOTICE '- 2 Waitlist entries';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'You can now view your dashboards with real data!';

END $$;
