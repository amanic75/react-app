-- Script to fix multi-tenant user isolation issues
-- This script helps identify and fix users showing up in the wrong company's user management

-- 1. First, let's see all companies and their users
SELECT 
  c.id as company_id,
  c.company_name,
  cu.user_id,
  up.email,
  up.first_name || ' ' || up.last_name as user_name,
  up.role as global_role,
  cu.role as company_role,
  cu.status
FROM companies c
LEFT JOIN company_users cu ON c.id = cu.company_id
LEFT JOIN user_profiles up ON cu.user_id = up.id
ORDER BY c.company_name, up.email;

-- 2. Check if there are any users not properly linked to companies
SELECT 
  up.id,
  up.email,
  up.first_name || ' ' || up.last_name as user_name,
  up.role,
  COUNT(cu.company_id) as company_count
FROM user_profiles up
LEFT JOIN company_users cu ON up.id = cu.user_id
WHERE up.role != 'NSight Admin'  -- NSight Admins don't belong to specific companies
GROUP BY up.id, up.email, up.first_name, up.last_name, up.role
HAVING COUNT(cu.company_id) = 0;

-- 3. Find users that might be in multiple companies (which could be valid)
SELECT 
  up.email,
  up.first_name || ' ' || up.last_name as user_name,
  COUNT(DISTINCT cu.company_id) as company_count,
  STRING_AGG(c.company_name, ', ') as companies
FROM user_profiles up
JOIN company_users cu ON up.id = cu.user_id
JOIN companies c ON cu.company_id = c.id
GROUP BY up.id, up.email, up.first_name, up.last_name
HAVING COUNT(DISTINCT cu.company_id) > 1;

-- 4. To fix a specific user showing in wrong company:
-- First, find the user and their current company associations
-- Then use this template to move them to the correct company:

-- Example: Move a user from one company to another
-- UPDATE company_users 
-- SET company_id = 'correct-company-uuid'
-- WHERE user_id = 'user-uuid' 
-- AND company_id = 'wrong-company-uuid';

-- 5. To remove a user from a company they shouldn't be in:
-- DELETE FROM company_users 
-- WHERE user_id = 'user-uuid' 
-- AND company_id = 'company-uuid-they-shouldnt-be-in';

-- 6. To add a user to their correct company:
-- INSERT INTO company_users (company_id, user_id, role, status, added_at)
-- VALUES ('correct-company-uuid', 'user-uuid', 'Admin', 'Active', NOW())
-- ON CONFLICT (company_id, user_id) DO NOTHING;

-- 7. Check which company a specific user (by email) is associated with:
-- SELECT 
--   up.email,
--   c.company_name,
--   cu.role as company_role,
--   cu.status
-- FROM user_profiles up
-- LEFT JOIN company_users cu ON up.id = cu.user_id
-- LEFT JOIN companies c ON cu.company_id = c.id
-- WHERE up.email = 'user@example.com'; 