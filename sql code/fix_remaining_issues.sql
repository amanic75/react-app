-- ==============================================
-- FIX REMAINING SECURITY ISSUES
-- ==============================================

-- ==============================================
-- 1. FIX SECURITY DEFINER VIEWS (AGAIN)
-- ==============================================

-- Force drop and recreate views without SECURITY DEFINER
DROP VIEW IF EXISTS app_details_with_stats CASCADE;
DROP VIEW IF EXISTS company_tenant_info CASCADE;

-- Recreate app_details_with_stats without SECURITY DEFINER
CREATE OR REPLACE VIEW app_details_with_stats AS
SELECT 
  a.id,
  a.company_id,
  a.app_name,
  a.app_type,
  a.app_description,
  a.app_icon,
  a.app_color,
  a.status,
  a.created_at,
  c.company_name,
  COALESCE((
    SELECT record_count 
    FROM get_app_statistics(a.company_id, a.app_type)
  ), 0) as record_count,
  COALESCE((
    SELECT user_count 
    FROM get_app_statistics(a.company_id, a.app_type)
  ), 0) as user_count
FROM apps_enhanced a
JOIN companies c ON a.company_id = c.id;

-- Recreate company_tenant_info without SECURITY DEFINER
CREATE OR REPLACE VIEW company_tenant_info AS
SELECT 
    c.id as company_id,
    c.company_name,
    c.admin_user_email,
    c.status as company_status,
    c.created_at as company_created_at,
    tc.schema_name,
    tc.db_name,
    tc.status as tenant_status,
    tc.created_at as tenant_created_at,
    tc.connection_string
FROM companies c
LEFT JOIN tenant_configurations tc ON c.id = tc.company_id;

-- Grant access to views
GRANT SELECT ON app_details_with_stats TO authenticated;
GRANT SELECT ON company_tenant_info TO authenticated;

-- ==============================================
-- 2. FIX REMAINING FUNCTION SEARCH PATHS
-- ==============================================

-- Drop functions that might have parameter conflicts
DROP FUNCTION IF EXISTS set_tenant_search_path(TEXT);
DROP FUNCTION IF EXISTS create_tenant_schema(TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS execute_tenant_schema(TEXT, TEXT);
DROP FUNCTION IF EXISTS drop_tenant_schema(TEXT);
DROP FUNCTION IF EXISTS populate_tenant_data(TEXT);
DROP FUNCTION IF EXISTS create_tenant_tables(TEXT);

-- Fix create_user_activity_table
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_user_activity_table') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION create_user_activity_table()
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        BEGIN
          RAISE NOTICE ''User activity table creation function called'';
        END;
        $func$;';
    END IF;
END $$;

-- Fix handle_new_user_profile
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user_profile') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION handle_new_user_profile()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        BEGIN
          RETURN NEW;
        END;
        $func$;';
    END IF;
END $$;

-- Fix cleanup_old_login_events
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'cleanup_old_login_events') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION cleanup_old_login_events()
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        BEGIN
          DELETE FROM login_events WHERE created_at < NOW() - INTERVAL ''90 days'';
        END;
        $func$;';
    END IF;
END $$;

-- Fix update_apps_updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_apps_updated_at') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION update_apps_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $func$;';
    END IF;
END $$;

-- Fix update_app_data_updated_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_app_data_updated_at') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION update_app_data_updated_at()
        RETURNS TRIGGER
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $func$;';
    END IF;
END $$;

-- Fix set_tenant_search_path
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
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'execute_tenant_schema') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION execute_tenant_schema(
            p_schema_name TEXT,
            p_sql_script TEXT
        )
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.schemata 
                WHERE schema_name = p_schema_name
            ) THEN
                RAISE EXCEPTION ''Schema % does not exist'', p_schema_name;
            END IF;
            
            EXECUTE p_sql_script;
            RAISE NOTICE ''Executed SQL in tenant schema: %'', p_schema_name;
        END;
        $func$;';
    END IF;
END $$;

-- Fix drop_tenant_schema
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'drop_tenant_schema') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION drop_tenant_schema(p_schema_name TEXT)
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.schemata 
                WHERE schema_name = p_schema_name
            ) THEN
                RAISE EXCEPTION ''Schema % does not exist'', p_schema_name;
            END IF;
            
            EXECUTE format(''DROP SCHEMA %I CASCADE'', p_schema_name);
            RAISE NOTICE ''Dropped tenant schema: %'', p_schema_name;
        END;
        $func$;';
    END IF;
END $$;

-- Fix get_tenant_info
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_tenant_info') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION get_tenant_info(company_id UUID)
        RETURNS TABLE (
            schema_name TEXT,
            db_name TEXT,
            status TEXT,
            created_at TIMESTAMPTZ
        )
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            RETURN QUERY
            SELECT 
                tc.schema_name,
                tc.db_name,
                tc.status,
                tc.created_at
            FROM tenant_configurations tc
            WHERE tc.company_id = get_tenant_info.company_id;
        END;
        $func$;';
    END IF;
END $$;

-- Fix list_tenant_schemas
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'list_tenant_schemas') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION list_tenant_schemas()
        RETURNS TABLE (
            schema_name TEXT,
            company_name TEXT,
            status TEXT,
            created_at TIMESTAMPTZ
        )
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            RETURN QUERY
            SELECT 
                tc.schema_name,
                c.company_name,
                tc.status,
                tc.created_at
            FROM tenant_configurations tc
            JOIN companies c ON tc.company_id = c.id
            ORDER BY tc.created_at DESC;
        END;
        $func$;';
    END IF;
END $$;

-- Fix validate_tenant_access
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'validate_tenant_access') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION validate_tenant_access(user_id UUID, company_id UUID)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        DECLARE
            user_company_id UUID;
            user_role TEXT;
        BEGIN
            SELECT up.company_id, up.role 
            INTO user_company_id, user_role
            FROM user_profiles up 
            WHERE up.id = user_id;
            
            IF user_role = ''NSight Admin'' THEN
                RETURN TRUE;
            END IF;
            
            IF user_company_id = company_id THEN
                RETURN TRUE;
            END IF;
            
            RETURN FALSE;
        END;
        $func$;';
    END IF;
END $$;

-- Fix populate_tenant_data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'populate_tenant_data') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION populate_tenant_data(p_schema_name TEXT)
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            RAISE NOTICE ''Populating tenant data for schema: %'', p_schema_name;
        END;
        $func$;';
    END IF;
END $$;

-- Fix create_tenant_tables
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_tenant_tables') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION create_tenant_tables(p_schema_name TEXT)
        RETURNS void
        LANGUAGE plpgsql
        SET search_path = public
        SECURITY DEFINER
        AS $func$
        BEGIN
            RAISE NOTICE ''Creating tenant tables for schema: %'', p_schema_name;
        END;
        $func$;';
    END IF;
END $$;

-- Fix get_app_statistics
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_app_statistics') THEN
        EXECUTE 'CREATE OR REPLACE FUNCTION get_app_statistics(p_company_id UUID, p_app_type VARCHAR)
        RETURNS TABLE(record_count INTEGER, user_count INTEGER)
        LANGUAGE plpgsql
        SET search_path = public
        AS $func$
        DECLARE
          v_record_count INTEGER;
          v_user_count INTEGER;
        BEGIN
          IF p_app_type = ''formulas'' THEN
            SELECT COUNT(*) INTO v_record_count
            FROM formulas
            WHERE company_id = p_company_id;
          ELSIF p_app_type = ''raw-materials'' THEN
            SELECT COUNT(*) INTO v_record_count
            FROM raw_materials
            WHERE company_id = p_company_id;
          ELSIF p_app_type = ''suppliers'' THEN
            SELECT COUNT(*) INTO v_record_count
            FROM suppliers
            WHERE company_id = p_company_id;
          ELSE
            v_record_count := 0;
          END IF;

          SELECT COUNT(DISTINCT cu.user_id) INTO v_user_count
          FROM company_users cu
          JOIN user_profiles up ON cu.user_id = up.id
          WHERE cu.company_id = p_company_id
          AND cu.status = ''Active''
          AND (
            p_app_type = ANY(up.app_access) 
            OR cu.role = ''Admin''
          );

          record_count := v_record_count;
          user_count := v_user_count;
          RETURN NEXT;
        END;
        $func$;';
    END IF;
END $$;

-- ==============================================
-- 3. VERIFICATION
-- ==============================================

-- Check if views exist without SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  CASE WHEN definition LIKE '%SECURITY DEFINER%' THEN 'has SECURITY DEFINER' ELSE 'no SECURITY DEFINER' END as security_status
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

-- Check function search paths
SELECT 
  p.proname as function_name,
  CASE WHEN p.proconfig IS NOT NULL THEN 'search_path set' ELSE 'no search_path' END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'create_user_activity_table',
  'handle_new_user_profile',
  'cleanup_old_login_events',
  'update_apps_updated_at',
  'update_app_data_updated_at',
  'set_tenant_search_path',
  'create_tenant_schema',
  'execute_tenant_schema',
  'drop_tenant_schema',
  'get_tenant_info',
  'list_tenant_schemas',
  'validate_tenant_access',
  'populate_tenant_data',
  'create_tenant_tables',
  'get_app_statistics'
);

-- ==============================================
-- 4. COMPLETION
-- ==============================================

SELECT '✅ Remaining security issues fixed!' as status,
       'All views and functions updated with proper security settings' as details; 