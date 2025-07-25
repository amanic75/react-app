-- ==============================================
-- CREATE MISSING USER PROFILE
-- Run this if a user is authenticated but has no profile
-- ==============================================

-- First, let's see what users exist in auth.users but don't have profiles
SELECT 
    u.id,
    u.email,
    u.created_at as auth_created,
    up.id as profile_exists
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- Create missing user profiles for authenticated users
INSERT INTO user_profiles (id, email, first_name, last_name, role, department)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'first_name', ''),
    COALESCE(u.raw_user_meta_data->>'last_name', ''),
    COALESCE(u.raw_user_meta_data->>'role', 'Employee'),
    COALESCE(u.raw_user_meta_data->>'department', '')
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- Verify the profiles were created
SELECT 
    email,
    first_name,
    last_name,
    role,
    department,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Missing user profiles created!';
    RAISE NOTICE 'All authenticated users now have profiles.';
    RAISE NOTICE 'Check the query results above to see the created profiles.';
END $$; 