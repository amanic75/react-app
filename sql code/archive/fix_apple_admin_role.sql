-- Fix Apple admin user role
-- This script updates the role for the Apple company admin who was incorrectly set as Employee

-- 1. First, let's find the Apple company and its admin user
SELECT 
  c.id as company_id,
  c.company_name,
  c.admin_user_email,
  up.id as user_id,
  up.email,
  up.first_name || ' ' || up.last_name as user_name,
  up.role as global_role,
  cu.role as company_role,
  cu.status
FROM companies c
LEFT JOIN user_profiles up ON up.email = c.admin_user_email
LEFT JOIN company_users cu ON cu.company_id = c.id AND cu.user_id = up.id
WHERE LOWER(c.company_name) LIKE '%apple%';

-- 2. Update the user's global role to Capacity Admin (if not already)
UPDATE user_profiles
SET 
  role = 'Capacity Admin',
  updated_at = NOW()
WHERE email IN (
  SELECT admin_user_email 
  FROM companies 
  WHERE LOWER(company_name) LIKE '%apple%'
)
AND role != 'Capacity Admin';

-- 3. Update the company_users role to Admin (if not already)
UPDATE company_users
SET 
  role = 'Admin',
  status = 'Active'
WHERE company_id IN (
  SELECT id 
  FROM companies 
  WHERE LOWER(company_name) LIKE '%apple%'
)
AND user_id IN (
  SELECT up.id 
  FROM user_profiles up
  JOIN companies c ON c.admin_user_email = up.email
  WHERE LOWER(c.company_name) LIKE '%apple%'
);

-- 4. Verify the changes
SELECT 
  c.company_name,
  c.admin_user_email,
  up.role as global_role,
  cu.role as company_role,
  cu.status as company_status
FROM companies c
JOIN user_profiles up ON up.email = c.admin_user_email
JOIN company_users cu ON cu.company_id = c.id AND cu.user_id = up.id
WHERE LOWER(c.company_name) LIKE '%apple%';

-- 5. If you know the exact email of the admin, you can also use this more specific query:
-- UPDATE user_profiles 
-- SET role = 'Capacity Admin', updated_at = NOW()
-- WHERE email = 'apple-admin@example.com';

-- UPDATE company_users cu
-- SET role = 'Admin'
-- FROM companies c
-- WHERE cu.company_id = c.id 
-- AND cu.user_id = (SELECT id FROM user_profiles WHERE email = 'apple-admin@example.com')
-- AND LOWER(c.company_name) LIKE '%apple%'; 