-- Seed script to create initial classrooms for testing
-- This script assumes you have at least one provider in the system

-- First, let's create a test provider if one doesn't exist
-- (You'll need to replace this with your actual provider ID)

-- Insert sample classrooms for a provider
-- Replace 'your-provider-id-here' with an actual provider_id from your profiles table

INSERT INTO classrooms (
  provider_id,
  name,
  age_group,
  licensed_capacity,
  current_enrollment,
  pending_enrollment,
  min_age_months,
  max_age_months,
  ratio_child_to_staff,
  max_ratio_child_to_staff,
  is_active
) VALUES
  -- Infants Room
  (
    (SELECT id FROM profiles WHERE role = 'provider' LIMIT 1),
    'Infants',
    'infant',
    8,
    6,
    0,
    0,
    12,
    4.0,
    4.0,
    true
  ),
  -- Toddlers Room
  (
    (SELECT id FROM profiles WHERE role = 'provider' LIMIT 1),
    'Toddlers',
    'toddler',
    12,
    10,
    1,
    13,
    24,
    5.0,
    6.0,
    true
  ),
  -- Pre-K Room
  (
    (SELECT id FROM profiles WHERE role = 'provider' LIMIT 1),
    'Pre-K',
    'pre-k',
    16,
    14,
    0,
    48,
    60,
    8.0,
    10.0,
    true
  )
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT * FROM classrooms;
