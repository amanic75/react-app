-- Quick fix: Restore Capacity Admin roles

-- Fix user_profiles: Any NSight Admin who is in company_users should be Capacity Admin
UPDATE user_profiles up
SET role = 'Capacity Admin'
WHERE up.role = 'NSight Admin'
AND EXISTS (
    SELECT 1 
    FROM company_users cu 
    WHERE cu.user_id = up.id 
    AND cu.company_id IS NOT NULL
);

-- Fix company_users table
UPDATE company_users
SET role = 'Capacity Admin'
WHERE role = 'NSight Admin';

-- Simple count to verify
SELECT role, COUNT(*) as user_count
FROM user_profiles
WHERE role IN ('Capacity Admin', 'NSight Admin', 'Employee')
GROUP BY role
ORDER BY role; 