-- ==============================================
-- SAFELY FIX ROLE CONSTRAINT ERROR
-- Run this in your Supabase SQL Editor
-- ==============================================

-- First, let's see what roles currently exist
DO $$
DECLARE
    role_record RECORD;
BEGIN
    RAISE NOTICE 'Current roles in database:';
    FOR role_record IN 
        SELECT DISTINCT role, COUNT(*) as count 
        FROM user_profiles 
        GROUP BY role
    LOOP
        RAISE NOTICE '- %: % users', role_record.role, role_record.count;
    END LOOP;
END $$;

-- Drop the existing constraint completely
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Update ALL existing users to use new role system
-- Handle any possible old values
UPDATE user_profiles SET role = 'Capacity Admin' WHERE role IN ('admin', 'administrator', 'Admin', 'Administrator');
UPDATE user_profiles SET role = 'NSight Admin' WHERE role IN ('manager', 'Manager', 'nsight-admin', 'NSight', 'Nsight Admin');  
UPDATE user_profiles SET role = 'Employee' WHERE role IN ('employee', 'Employee', 'user', 'User') OR role IS NULL;

-- Handle any other unexpected values by setting them to Employee
UPDATE user_profiles SET role = 'Employee' WHERE role NOT IN ('Employee', 'NSight Admin', 'Capacity Admin');

-- Now add the new constraint (this should work now)
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('Employee', 'NSight Admin', 'Capacity Admin'));

-- Update the default value
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'Employee';

-- Verify the fix worked by showing updated roles
DO $$
DECLARE
    role_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Role constraint fixed!';
    RAISE NOTICE 'Updated roles in database:';
    FOR role_record IN 
        SELECT DISTINCT role, COUNT(*) as count 
        FROM user_profiles 
        GROUP BY role 
        ORDER BY role
    LOOP
        RAISE NOTICE '- %: % users', role_record.role, role_record.count;
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'You can now create accounts with the new role system.';
END $$; 