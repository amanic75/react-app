-- ==============================================
-- FIX FINAL FUNCTION SEARCH PATHS - CLEAN APPROACH
-- Drop ALL versions of problematic functions and recreate
-- ==============================================

-- First, show all existing versions of these functions
SELECT 
  'EXISTING FUNCTIONS:' as info,
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

-- Drop ALL versions of cleanup_old_login_events (any signature)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'cleanup_old_login_events'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I(%s)', func_record.proname, func_record.args);
  END LOOP;
END $$;

-- Drop ALL versions of populate_tenant_data (any signature)
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT p.oid, p.proname, pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'populate_tenant_data'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I(%s)', func_record.proname, func_record.args);
  END LOOP;
END $$;

-- Now create the correct versions
CREATE OR REPLACE FUNCTION cleanup_old_login_events()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  DELETE FROM login_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

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

-- Show final functions
SELECT 
  'FINAL FUNCTIONS:' as info,
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

-- Test the functions
SELECT 'Testing cleanup_old_login_events:' as test;
SELECT cleanup_old_login_events();

SELECT 'Testing populate_tenant_data:' as test;
SELECT populate_tenant_data('test_schema'::TEXT);

SELECT '✅ Final function search paths fixed!' as status; 