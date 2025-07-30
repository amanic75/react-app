-- ==============================================
-- FIX FINAL FUNCTION SEARCH PATHS
-- Fix the last 2 function warnings
-- ==============================================

-- Check existing functions first
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.oid as function_oid
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'cleanup_old_login_events',
  'populate_tenant_data'
);

-- Fix cleanup_old_login_events (force recreate)
DROP FUNCTION IF EXISTS cleanup_old_login_events();
CREATE OR REPLACE FUNCTION cleanup_old_login_events()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM login_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Fix populate_tenant_data (force recreate)
DROP FUNCTION IF EXISTS populate_tenant_data(TEXT);
CREATE OR REPLACE FUNCTION populate_tenant_data(p_schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    RAISE NOTICE 'Populating tenant data for schema: %', p_schema_name;
END;
$$;

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Check if the functions now have search paths set
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE WHEN p.proconfig IS NOT NULL THEN '✅ search_path set' ELSE '❌ no search_path' END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'cleanup_old_login_events',
  'populate_tenant_data'
);

-- Test the functions work (with explicit signatures)
SELECT 'Testing cleanup_old_login_events function:' as test;
SELECT cleanup_old_login_events();

SELECT 'Testing populate_tenant_data function:' as test;
SELECT populate_tenant_data('test_schema'::TEXT);

SELECT '✅ Final function search paths fixed!' as status; 