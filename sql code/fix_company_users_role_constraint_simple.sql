-- Fix the company_users role constraint to allow "NSight Admin"

-- Drop the old constraint
ALTER TABLE company_users DROP CONSTRAINT IF EXISTS company_users_role_check;

-- Add the new constraint that includes "NSight Admin"
ALTER TABLE company_users 
ADD CONSTRAINT company_users_role_check 
CHECK (role IN ('Employee', 'Admin', 'Capacity Admin', 'NSight Admin'));

-- Now update any "Admin" roles to "NSight Admin"
UPDATE public.company_users
SET role = 'NSight Admin'
WHERE role = 'Admin';

UPDATE public.user_profiles
SET role = 'NSight Admin'
WHERE role = 'Admin';

-- Show the results
SELECT 'Updated roles to NSight Admin' as status; 