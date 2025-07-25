-- Emergency fix: Restore Capacity Admin roles
-- The previous script incorrectly converted ALL Admin roles to NSight Admin

-- First, let's see what we have
SELECT 
    cu.user_id,
    cu.company_id,
    cu.role as company_users_role,
    up.role as user_profiles_role,
    up.email,
    c.name as company_name
FROM company_users cu
JOIN user_profiles up ON cu.user_id = up.id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE cu.role = 'NSight Admin' OR up.role = 'NSight Admin'
ORDER BY cu.company_id, up.email;

-- Fix: NSight Admins should NOT be in company_users table (they're platform admins)
-- If a user is in company_users with a company_id, they should be a Capacity Admin, not NSight Admin

-- Step 1: Update company_users table - change NSight Admin to Capacity Admin for users with company associations
UPDATE company_users
SET role = 'Capacity Admin'
WHERE role = 'NSight Admin' 
AND company_id IS NOT NULL;

-- Step 2: Update user_profiles - if user is in company_users, they should be Capacity Admin
UPDATE user_profiles up
SET role = 'Capacity Admin'
WHERE up.id IN (
    SELECT user_id 
    FROM company_users 
    WHERE company_id IS NOT NULL
)
AND up.role = 'NSight Admin';

-- Step 3: For now, let's just fix company admins
-- You'll need to manually set NSight Admin role for platform admins later

-- Verify the fix
SELECT 'After Fix - Role Distribution:' as status;
SELECT role, COUNT(*) as count 
FROM user_profiles 
GROUP BY role
ORDER BY role;

SELECT 'Company Users Role Distribution:' as status;
SELECT role, COUNT(*) as count 
FROM company_users 
GROUP BY role
ORDER BY role; 