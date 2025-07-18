-- ==============================================
-- UPDATE EXISTING ROLES TO NEW SYSTEM
-- Run this ONLY if you have existing users
-- ==============================================

-- First, update existing roles to new naming
UPDATE user_profiles SET role = 'Capacity Admin' WHERE role = 'admin';
UPDATE user_profiles SET role = 'NSight Admin' WHERE role = 'manager';
UPDATE user_profiles SET role = 'Employee' WHERE role = 'employee';

-- Drop the old constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the new constraint
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('Employee', 'NSight Admin', 'Capacity Admin'));

-- Update the default value
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'Employee';

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ User roles updated successfully!';
    RAISE NOTICE 'New role system:';
    RAISE NOTICE '- Capacity Admin: Full system access (AdminDashboard)';
    RAISE NOTICE '- NSight Admin: Specialized admin access (NsightAdminDashboard)';
    RAISE NOTICE '- Employee: Standard access (EmployeeDashboard)';
END $$; 