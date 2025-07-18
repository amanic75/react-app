-- Fix default role constraint that might be setting all new users to 'Employee'

-- 1. Check current default value for role column
SELECT 
  table_name,
  column_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'role';

-- 2. Remove default constraint if it's set to 'Employee'
ALTER TABLE user_profiles 
ALTER COLUMN role DROP DEFAULT;

-- 3. Check company_users table defaults
SELECT 
  table_name,
  column_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'company_users'
AND column_name = 'role';

-- 4. If needed, update the company_users default to be more flexible
-- ALTER TABLE company_users 
-- ALTER COLUMN role DROP DEFAULT;

-- 5. Create a function to handle new user profile creation with proper role
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is not specified, check the user metadata
  IF NEW.role IS NULL THEN
    -- Try to get role from auth.users metadata
    SELECT 
      COALESCE(
        raw_user_meta_data->>'role',
        'Employee'  -- Default to Employee only if no role specified
      ) INTO NEW.role
    FROM auth.users
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_user_profile_created ON user_profiles;

-- 7. Create trigger to set role from metadata
CREATE TRIGGER on_user_profile_created
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();

-- 8. Verify the changes
SELECT 
  'After changes - user_profiles defaults:' as info,
  column_name,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND column_name = 'role'; 