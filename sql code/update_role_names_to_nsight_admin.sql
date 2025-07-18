-- Update old "Admin" role names to "NSight Admin"
-- This script ensures consistency with the new naming convention

-- Update user_profiles table
UPDATE public.user_profiles
SET role = 'NSight Admin'
WHERE role = 'Admin';

-- Update company_users table 
UPDATE public.company_users
SET role = 'NSight Admin'
WHERE role = 'Admin';

-- Also update any "company_role" columns that might have "Admin"
UPDATE public.user_profiles
SET company_role = 'NSight Admin'
WHERE company_role = 'Admin';

-- Log the changes
DO $$
DECLARE
    profiles_updated INTEGER;
    company_users_updated INTEGER;
    company_roles_updated INTEGER;
BEGIN
    GET DIAGNOSTICS profiles_updated = ROW_COUNT;
    
    SELECT COUNT(*) INTO company_users_updated 
    FROM company_users WHERE role = 'NSight Admin';
    
    SELECT COUNT(*) INTO company_roles_updated
    FROM user_profiles WHERE company_role = 'NSight Admin';
    
    RAISE NOTICE 'Updated % user_profiles roles to NSight Admin', profiles_updated;
    RAISE NOTICE 'Total company_users with NSight Admin role: %', company_users_updated;
    RAISE NOTICE 'Total user_profiles with NSight Admin company_role: %', company_roles_updated;
END $$; 