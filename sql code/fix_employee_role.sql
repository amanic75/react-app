-- Fix employee role for angads@capacity.com
-- This user should be an Employee, not a Capacity Admin

UPDATE user_profiles 
SET role = 'Employee'
WHERE email = 'angads@capacity.com' 
AND role = 'Capacity Admin';

-- Verify the change
SELECT id, email, first_name, last_name, role, app_access 
FROM user_profiles 
WHERE email = 'angads@capacity.com'; 