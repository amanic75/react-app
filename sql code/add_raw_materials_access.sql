-- Add 'raw_materials' app access to employees
-- This script adds 'raw_materials' to the app_access array for all employees

-- First, let's check the data type of app_access column
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'app_access';

-- First, let's see what the current app_access values are
SELECT 
  up.id,
  up.email,
  up.role,
  up.app_access,
  up.app_access::text as app_access_text,
  pg_typeof(up.app_access) as data_type
FROM user_profiles up
WHERE up.role = 'Employee';

-- Update employees to include 'raw_materials' in their app_access
-- Handle JSONB array type
UPDATE user_profiles 
SET app_access = CASE 
  WHEN app_access IS NULL THEN '["raw_materials"]'::jsonb
  WHEN NOT (app_access @> '["raw_materials"]') THEN app_access || '["raw_materials"]'::jsonb
  ELSE app_access
END
WHERE role = 'Employee';

-- Verify the changes
SELECT 
  up.id,
  up.email,
  up.role,
  up.app_access,
  up.app_access::text as app_access_text
FROM user_profiles up
WHERE up.role = 'Employee'; 