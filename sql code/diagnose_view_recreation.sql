-- ==============================================
-- DIAGNOSE VIEW RECREATION ISSUE
-- Find what's recreating views with SECURITY DEFINER
-- ==============================================

-- Check current view definitions
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status,
  LEFT(definition, 200) as definition_preview
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

-- Check if there are any functions that might be recreating these views
SELECT 
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosrc LIKE '%app_details_with_stats%'
OR p.prosrc LIKE '%company_tenant_info%';

-- Check for any triggers that might be affecting views
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE action_statement LIKE '%app_details_with_stats%'
OR action_statement LIKE '%company_tenant_info%';

-- Check for any scheduled jobs or cron functions
SELECT 
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosrc LIKE '%cron%'
OR p.prosrc LIKE '%schedule%'
OR p.prosrc LIKE '%job%';

-- Check if there are any other scripts that might be running
-- Look for any functions that create views
SELECT 
  p.proname as function_name,
  p.prosrc as function_source
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prosrc LIKE '%CREATE VIEW%'
OR p.prosrc LIKE '%CREATE OR REPLACE VIEW%';

-- Check for any extensions that might be affecting views
SELECT 
  extname,
  extversion
FROM pg_extension;

-- Check if there are any other schemas that might have these views
SELECT 
  schemaname,
  viewname
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info');

SELECT '🔍 Diagnostic complete - check the results above!' as status; 