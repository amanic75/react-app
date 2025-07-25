-- Check and fix the company_users role constraint to allow "NSight Admin"

-- First, let's see what the current constraint is
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM 
    pg_constraint
WHERE 
    conrelid = 'company_users'::regclass
    AND conname LIKE '%role%';

-- Drop the old constraint
ALTER TABLE company_users DROP CONSTRAINT IF EXISTS company_users_role_check;

-- Add the new constraint that includes "NSight Admin"
ALTER TABLE company_users 
ADD CONSTRAINT company_users_role_check 
CHECK (role IN ('Employee', 'Admin', 'Capacity Admin', 'NSight Admin'));

-- Now we can safely update the roles
-- Update any "Admin" roles to "NSight Admin" in company_users
UPDATE public.company_users
SET role = 'NSight Admin'
WHERE role = 'Admin';

-- Also update user_profiles table
UPDATE public.user_profiles
SET role = 'NSight Admin'
WHERE role = 'Admin';

-- Check if company_role column exists and update if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'company_role'
    ) THEN
        UPDATE public.user_profiles
        SET company_role = 'NSight Admin'
        WHERE company_role = 'Admin';
    END IF;
END $$;

-- Verify the updates
SELECT 
    'company_users' as table_name,
    role, 
    COUNT(*) as count 
FROM company_users 
GROUP BY role
UNION ALL
SELECT 
    'user_profiles' as table_name,
    role, 
    COUNT(*) as count 
FROM user_profiles 
WHERE role IS NOT NULL
GROUP BY role
ORDER BY table_name, role; 