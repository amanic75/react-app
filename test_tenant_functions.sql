-- Test if multi-tenant schema functions exist in the database

-- Check if create_tenant_schema function exists
SELECT 'create_tenant_schema function exists:' as test_name;
SELECT COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_name = 'create_tenant_schema';

-- Check if execute_tenant_schema function exists
SELECT 'execute_tenant_schema function exists:' as test_name;
SELECT COUNT(*) as function_count
FROM information_schema.routines 
WHERE routine_name = 'execute_tenant_schema';

-- Check if tenant_configurations table exists
SELECT 'tenant_configurations table exists:' as test_name;
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_name = 'tenant_configurations';

-- Show any existing tenant configurations
SELECT 'Existing tenant configurations:' as test_name;
SELECT company_id, company_name, schema_name, status, created_at
FROM tenant_configurations 
ORDER BY created_at DESC
LIMIT 10; 