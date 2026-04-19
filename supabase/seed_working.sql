-- WORKING Seed Data for Day Care Ecosystem
-- This matches your ACTUAL database schema
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  provider_user_id UUID;
  provider_profile_id UUID;
  parent1_user_id UUID;
  parent2_user_id UUID;
  parent3_user_id UUID;
  child1_id UUID;
  child2_id UUID;
  child3_id UUID;
  child4_id UUID;
BEGIN
  -- Get provider user
  SELECT id INTO provider_user_id 
  FROM auth.users 
  WHERE email LIKE '%provider%' OR email = 'nonololy509@gmail.com'
  LIMIT 1;

  IF provider_user_id IS NULL THEN
    RAISE NOTICE 'ERROR: No provider user found!';
    RETURN;
  END IF;

  -- Get provider profile
  SELECT id INTO provider_profile_id
  FROM profiles
  WHERE user_id = provider_user_id;

  RAISE NOTICE 'Using provider: % (profile: %)', provider_user_id, provider_profile_id;

  -- ==========================================
  -- GET EXISTING PARENT USERS
  -- ==========================================
  
  -- Use the existing parent user (Marie Antoine - youngaurelus@gmail.com)
  SELECT id INTO parent1_user_id FROM auth.users WHERE email = 'youngaurelus@gmail.com';
  
  IF parent1_user_id IS NULL THEN
    -- Try to find any parent user
    SELECT id INTO parent1_user_id FROM auth.users 
    WHERE id IN (SELECT user_id FROM profiles WHERE role = 'parent')
    LIMIT 1;
  END IF;

  IF parent1_user_id IS NULL THEN
    RAISE NOTICE 'ERROR: No parent user found! Please create a parent account first.';
    RETURN;
  END IF;

  -- Use same parent for all children (you can create more parent accounts later)
  parent2_user_id := parent1_user_id;
  parent3_user_id := parent1_user_id;

  RAISE NOTICE 'Using parent: %', parent1_user_id;

  -- ==========================================
  -- CREATE CHILDREN (using actual schema: name, parent_id)
  -- ==========================================
  
  INSERT INTO children (parent_id, name, date_of_birth, allergies, medical_notes)
  VALUES (
    parent1_user_id,
    'Emma Johnson',
    '2024-03-15', -- ~2 years old
    'None',
    'Loves painting and music time'
  )
  RETURNING id INTO child1_id;

  INSERT INTO children (parent_id, name, date_of_birth, allergies, medical_notes)
  VALUES (
    parent2_user_id,
    'Noah Chen',
    '2023-06-20', -- ~3 years old
    'Dairy',
    'Very active, enjoys outdoor play'
  )
  RETURNING id INTO child2_id;

  INSERT INTO children (parent_id, name, date_of_birth, allergies, medical_notes)
  VALUES (
    parent2_user_id,
    'Sophia Chen',
    '2025-01-10', -- ~1 year old
    'None',
    'Sibling with Noah'
  )
  RETURNING id INTO child3_id;

  INSERT INTO children (parent_id, name, date_of_birth, allergies, medical_notes)
  VALUES (
    parent3_user_id,
    'Liam Davis',
    '2021-09-05', -- ~4 years old
    'Peanuts',
    'Enjoys reading and puzzles'
  )
  RETURNING id INTO child4_id;

  RAISE NOTICE '✅ Created 4 children';

  -- ==========================================
  -- CREATE ATTENDANCE RECORDS (if table exists)
  -- ==========================================
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
    -- Check what columns attendance table has
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'attendance' AND column_name = 'provider_id') THEN
      -- New schema with provider_id (references auth.users, not profiles)
      INSERT INTO attendance (child_id, provider_id, date, check_in_time)
      VALUES (
        child1_id,
        provider_user_id,  -- Use user_id, not profile_id
        CURRENT_DATE,
        (CURRENT_DATE + TIME '07:15:00')::timestamptz
      );

      INSERT INTO attendance (child_id, provider_id, date, check_in_time)
      VALUES (
        child2_id,
        provider_user_id,  -- Use user_id, not profile_id
        CURRENT_DATE,
        (CURRENT_DATE + TIME '07:30:00')::timestamptz
      );

      INSERT INTO attendance (child_id, provider_id, date, check_in_time)
      VALUES (
        child3_id,
        provider_user_id,  -- Use user_id, not profile_id
        CURRENT_DATE,
        (CURRENT_DATE + TIME '08:00:00')::timestamptz
      );

      RAISE NOTICE '✅ Created 3 attendance records (today)';
    ELSE
      RAISE NOTICE '⚠️  Attendance table exists but schema unclear - skipping';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Attendance table does not exist - skipping';
  END IF;

  -- ==========================================
  -- CREATE BOOKINGS (if table exists)
  -- ==========================================
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
    -- Check if bookings has the expected columns
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'start_date') THEN
      INSERT INTO bookings (parent_id, provider_id, child_id, start_date, end_date, booking_type, status, total_price, notes)
      VALUES (
        parent1_user_id,
        provider_user_id,
        child1_id,
        CURRENT_DATE + INTERVAL '1 day',
        CURRENT_DATE + INTERVAL '1 day',
        'full_day',
        'confirmed',
        65.00,
        'Regular booking'
      );
      RAISE NOTICE '✅ Created bookings';
    ELSE
      RAISE NOTICE '⚠️  Bookings table has different schema - skipping';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Bookings table does not exist - skipping';
  END IF;

  -- ==========================================
  -- SUMMARY
  -- ==========================================
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SEED DATA COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Provider: %', provider_user_id;
  RAISE NOTICE '4 Children created';
  RAISE NOTICE 'Check attendance and bookings tables above';
  RAISE NOTICE '========================================';

END $$;
