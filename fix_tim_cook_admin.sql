-- Fix Tim Cook's admin role for Apple Test Company

-- 1. Update Tim Cook's global role to Capacity Admin
UPDATE user_profiles
SET 
  role = 'Capacity Admin',
  updated_at = NOW()
WHERE email = 'tim@apple.com'
AND role != 'Capacity Admin';

-- 2. Check if Tim is linked to Apple Test Company in company_users
SELECT 
  'Checking company_users link:' as info,
  cu.*
FROM company_users cu
WHERE cu.company_id = 'e242a650-d039-4105-8179-bce76a1fec22'
AND cu.user_id = 'c8377623-1e21-49ff-b301-7aadcc535f40';

-- 3. Insert or update the company_users record to properly link Tim as Admin
INSERT INTO company_users (
  company_id,
  user_id,
  role,
  status,
  added_at
) VALUES (
  'e242a650-d039-4105-8179-bce76a1fec22',  -- Apple Test Company ID
  'c8377623-1e21-49ff-b301-7aadcc535f40',  -- Tim Cook's user ID
  'Admin',
  'Active',
  NOW()
)
ON CONFLICT (company_id, user_id) 
DO UPDATE SET
  role = 'Admin',
  status = 'Active';

-- 4. Verify the fix
SELECT 
  c.company_name,
  up.email,
  up.first_name || ' ' || up.last_name as user_name,
  up.role as global_role,
  cu.role as company_role,
  cu.status as company_status
FROM companies c
JOIN company_users cu ON c.id = cu.company_id
JOIN user_profiles up ON cu.user_id = up.id
WHERE c.id = 'e242a650-d039-4105-8179-bce76a1fec22'
AND up.email = 'tim@apple.com';

-- 5. Also ensure the company record has the correct admin email
UPDATE companies
SET 
  admin_user_email = 'tim@apple.com',
  admin_user_name = 'Tim Cook'
WHERE id = 'e242a650-d039-4105-8179-bce76a1fec22'
AND admin_user_email = 'tim@apple.com'; 