-- Disable User Validation Triggers
-- This script removes the validation triggers that check auth.users table
-- which is causing permission denied errors

-- Drop ALL existing triggers (both validation and cleaning)
DROP TRIGGER IF EXISTS validate_raw_materials_assigned_users ON raw_materials;
DROP TRIGGER IF EXISTS validate_formulas_assigned_users ON formulas;
DROP TRIGGER IF EXISTS validate_suppliers_assigned_users ON suppliers;
DROP TRIGGER IF EXISTS clean_raw_materials_assigned_users ON raw_materials;
DROP TRIGGER IF EXISTS clean_formulas_assigned_users ON formulas;
DROP TRIGGER IF EXISTS clean_suppliers_assigned_users ON suppliers;

-- Drop the validation function
DROP FUNCTION IF EXISTS validate_assigned_users();
DROP FUNCTION IF EXISTS clean_assigned_users();

-- No need to create new triggers - just let the database handle the arrays as-is

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ User validation triggers disabled successfully!';
    RAISE NOTICE 'The app can now add materials without auth.users permission checks.';
END $$; 