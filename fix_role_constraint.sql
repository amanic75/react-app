-- ==============================================
-- FIX ROLE CONSTRAINT ERROR
-- Run this in your Supabase SQL Editor immediately
-- ==============================================

-- Drop the old constraint that's causing the error
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the new constraint with correct role values
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('Employee', 'NSight Admin', 'Capacity Admin'));

-- Update the default value
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'Employee';

-- Update any existing users with old role values
UPDATE user_profiles SET role = 'Capacity Admin' WHERE role = 'admin';
UPDATE user_profiles SET role = 'NSight Admin' WHERE role = 'manager';  
UPDATE user_profiles SET role = 'Employee' WHERE role = 'employee';

-- Verify the fix worked
DO $$
BEGIN
    RAISE NOTICE '✅ Role constraint fixed!';
    RAISE NOTICE 'Valid roles are now:';
    RAISE NOTICE '- Employee (default)';
    RAISE NOTICE '- NSight Admin';
    RAISE NOTICE '- Capacity Admin';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now create accounts with the new role system.';
END $$; 