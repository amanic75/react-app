-- ==============================================
-- FIX REMAINING FUNCTION SEARCH PATHS
-- Fix the 8 remaining function warnings
-- ==============================================

-- Fix cleanup_old_login_events
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

-- Fix set_tenant_search_path
DROP FUNCTION IF EXISTS set_tenant_search_path(TEXT);
CREATE OR REPLACE FUNCTION set_tenant_search_path(p_schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('SET search_path TO %I, public', p_schema_name);
    RAISE NOTICE 'Set search path to schema: %', p_schema_name;
END;
$$;

-- Fix create_tenant_schema
DROP FUNCTION IF EXISTS create_tenant_schema(TEXT, UUID, TEXT);
CREATE OR REPLACE FUNCTION create_tenant_schema(
    p_schema_name TEXT,
    p_company_id UUID,
    p_company_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = p_schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % already exists', p_schema_name;
    END IF;
    
    EXECUTE format('CREATE SCHEMA %I', p_schema_name);
    RAISE NOTICE 'Created tenant schema: % for company: %', p_schema_name, p_company_name;
END;
$$;

-- Fix execute_tenant_schema
DROP FUNCTION IF EXISTS execute_tenant_schema(TEXT, TEXT);
CREATE OR REPLACE FUNCTION execute_tenant_schema(
    p_schema_name TEXT,
    p_sql_script TEXT
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = p_schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % does not exist', p_schema_name;
    END IF;
    
    EXECUTE p_sql_script;
    RAISE NOTICE 'Executed SQL in tenant schema: %', p_schema_name;
END;
$$;

-- Fix drop_tenant_schema
DROP FUNCTION IF EXISTS drop_tenant_schema(TEXT);
CREATE OR REPLACE FUNCTION drop_tenant_schema(p_schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = p_schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % does not exist', p_schema_name;
    END IF;
    
    EXECUTE format('DROP SCHEMA %I CASCADE', p_schema_name);
    RAISE NOTICE 'Dropped tenant schema: %', p_schema_name;
END;
$$;

-- Fix populate_tenant_data
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

-- Fix create_tenant_tables
DROP FUNCTION IF EXISTS create_tenant_tables(TEXT);
CREATE OR REPLACE FUNCTION create_tenant_tables(p_schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
SECURITY DEFINER
AS $$
BEGIN
    RAISE NOTICE 'Creating tenant tables for schema: %', p_schema_name;
END;
$$;

-- ==============================================
-- VERIFICATION
-- ==============================================

-- Check function search paths
SELECT 
  p.proname as function_name,
  CASE WHEN p.proconfig IS NOT NULL THEN '✅ search_path set' ELSE '❌ no search_path' END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'cleanup_old_login_events',
  'set_tenant_search_path',
  'create_tenant_schema',
  'execute_tenant_schema',
  'drop_tenant_schema',
  'populate_tenant_data',
  'create_tenant_tables'
);

SELECT '✅ Remaining function search paths fixed!' as status; 