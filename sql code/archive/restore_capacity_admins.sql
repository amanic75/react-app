-- Simple fix: Restore Capacity Admin roles for company-associated users

-- Any admin user that belongs to a company should be a Capacity Admin, not NSight Admin
UPDATE user_profiles up
SET role = 'Capacity Admin'
WHERE up.role = 'NSight Admin'
AND EXISTS (
    SELECT 1 
    FROM company_users cu 
    WHERE cu.user_id = up.id 
    AND cu.company_id IS NOT NULL
);

-- Also update the company_users table
UPDATE company_users
SET role = 'Capacity Admin'
WHERE role = 'NSight Admin';

-- Show results
SELECT 
    up.email,
    up.role,
    cu.company_id
FROM user_profiles up
LEFT JOIN company_users cu ON cu.user_id = up.id
WHERE up.role IN ('Capacity Admin', 'NSight Admin')
ORDER BY up.role, up.email; 