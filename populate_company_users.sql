-- Populate company_users table with all users that should be associated with Capacity Chemicals
-- Company ID: f42538be-9dcb-493a-9e2e-8b10691ace25

-- First, let's see what users exist in the system
SELECT 'All users in user_profiles:' as info;
SELECT id, email, first_name, last_name, role, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- Check if there are any users with company_id in user_metadata
-- Note: This might not work if user_metadata is not accessible via SQL

-- Let's see what auth users exist (if accessible)
SELECT 'Users in auth.users (if accessible):' as info;
SELECT id, email, raw_user_meta_data, created_at 
FROM auth.users 
WHERE raw_user_meta_data IS NOT NULL
ORDER BY created_at DESC;

-- Clear existing company_users data
TRUNCATE TABLE company_users;

-- Strategy 1: Insert users who have emails that suggest they belong to Capacity Chemicals
-- This includes admin users and others who might be associated
INSERT INTO company_users (company_id, user_id, role, status)
SELECT 
    'f42538be-9dcb-493a-9e2e-8b10691ace25'::uuid as company_id,
    up.id as user_id,
    CASE 
        WHEN up.email LIKE '%admin%' OR up.role = 'Capacity Admin' THEN 'Admin'
        WHEN up.role = 'Manager' THEN 'Manager'  
        ELSE 'Employee'
    END as role,
    'Active' as status
FROM user_profiles up
WHERE up.email != 'nsight.admin@nsight-inc.com'  -- Exclude NSight admin
ON CONFLICT (company_id, user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Show results
SELECT 'Users added to company_users:' as info;
SELECT 
    cu.company_id,
    cu.user_id,
    up.email,
    up.first_name,
    up.last_name,
    cu.role,
    cu.status,
    cu.added_at
FROM company_users cu
JOIN user_profiles up ON cu.user_id = up.id
WHERE cu.company_id = 'f42538be-9dcb-493a-9e2e-8b10691ace25'
ORDER BY cu.added_at DESC;

-- Count users for Capacity Chemicals
SELECT 'User count for Capacity Chemicals:' as info;
SELECT COUNT(*) as user_count
FROM company_users 
WHERE company_id = 'f42538be-9dcb-493a-9e2e-8b10691ace25'
AND status = 'Active'; 