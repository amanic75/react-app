-- Test script to change admintest@capacity.com to Capacity Admin role
-- This is for testing the role detection fix

-- Update the user_profiles table
UPDATE user_profiles 
SET role = 'Capacity Admin' 
WHERE email = 'admintest@capacity.com';

-- Update the auth.users metadata to match
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"Capacity Admin"'
)
WHERE email = 'admintest@capacity.com';

-- Verify the changes
SELECT 
  up.email,
  up.role as profile_role,
  au.raw_user_meta_data->>'role' as auth_role
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
WHERE up.email = 'admintest@capacity.com'; 