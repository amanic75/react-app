-- Fix user roles based on app access patterns
-- This is a more reliable approach than guessing based on email or company associations

-- First, let's see what app access patterns we have
SELECT 
    up.email,
    up.role as current_role,
    up.app_access,
    CASE 
        WHEN up.app_access @> '["developer-mode"]'::jsonb OR up.app_access @> '["existing-company-mode"]'::jsonb THEN 'NSight Admin'
        WHEN up.app_access @> '["formulas", "suppliers", "raw-materials"]'::jsonb THEN 'Capacity Admin'
        WHEN up.app_access @> '["formulas"]'::jsonb AND NOT (up.app_access @> '["suppliers"]'::jsonb OR up.app_access @> '["raw-materials"]'::jsonb) THEN 'Employee'
        ELSE 'Employee'
    END as suggested_role
FROM user_profiles up
WHERE up.app_access IS NOT NULL
ORDER BY up.email;

-- Update roles based on app access patterns
-- NSight Admin: Has developer-mode OR existing-company-mode
UPDATE user_profiles
SET role = 'NSight Admin'
WHERE (app_access @> '["developer-mode"]'::jsonb OR app_access @> '["existing-company-mode"]'::jsonb)
AND role != 'NSight Admin';

-- Capacity Admin: Has all three business apps (formulas, suppliers, raw-materials)
UPDATE user_profiles
SET role = 'Capacity Admin'
WHERE app_access @> '["formulas", "suppliers", "raw-materials"]'::jsonb
AND NOT (app_access @> '["developer-mode"]'::jsonb OR app_access @> '["existing-company-mode"]'::jsonb)
AND role != 'Capacity Admin';

-- Employee: Has only formulas access (or limited access)
UPDATE user_profiles
SET role = 'Employee'
WHERE (app_access @> '["formulas"]'::jsonb AND NOT (app_access @> '["suppliers"]'::jsonb OR app_access @> '["raw-materials"]'::jsonb))
AND NOT (app_access @> '["developer-mode"]'::jsonb OR app_access @> '["existing-company-mode"]'::jsonb)
AND role != 'Employee';

-- Also update company_users table to match
UPDATE company_users cu
SET role = (
    SELECT up.role 
    FROM user_profiles up 
    WHERE up.id = cu.user_id
)
WHERE EXISTS (
    SELECT 1 
    FROM user_profiles up 
    WHERE up.id = cu.user_id 
    AND up.role != cu.role
);

-- Show final results
SELECT 
    'Final Role Distribution:' as status,
    role,
    COUNT(*) as count
FROM user_profiles
GROUP BY role
ORDER BY role; 