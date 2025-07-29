-- Update user's auth metadata to have correct role
-- This will update the user's auth session metadata to match the database role

-- First, let's see the current auth metadata
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'angads@capacity.com';

-- Update the auth metadata to have the correct role
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"Employee"'
)
WHERE email = 'angads@capacity.com';

-- Verify the change
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'angads@capacity.com'; 