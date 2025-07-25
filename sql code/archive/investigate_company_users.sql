-- Investigate existing company_users table structure and constraints

-- Show table structure with all columns
SELECT 'company_users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'company_users'
ORDER BY ordinal_position;

-- Show check constraints
SELECT 'Check constraints on company_users:' as info;
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%company_users%';

-- Show all constraints
SELECT 'All constraints on company_users:' as info;
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'company_users';

-- Show any existing data
SELECT 'Existing data in company_users:' as info;
SELECT * FROM company_users LIMIT 10;

-- Try to see what the role constraint allows
SELECT 'Role constraint details:' as info;
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conname LIKE '%role%' AND conrelid = 'company_users'::regclass; 