-- Fix all employee roles for @capacity.com users
-- This script will update all users with @capacity.com emails who have 'Capacity Admin' role to 'Employee' role

-- First, let's see what users will be affected
SELECT id, email, first_name, last_name, role, app_access 
FROM user_profiles 
WHERE email LIKE '%@capacity.com' 
AND role = 'Capacity Admin';

-- Update all @capacity.com users with 'Capacity Admin' role to 'Employee' role
UPDATE user_profiles 
SET role = 'Employee'
WHERE email LIKE '%@capacity.com' 
AND role = 'Capacity Admin';

-- Verify the changes
SELECT id, email, first_name, last_name, role, app_access 
FROM user_profiles 
WHERE email LIKE '%@capacity.com' 
ORDER BY email; 