-- ==============================================
-- AGGRESSIVE FIX FOR SECURITY DEFINER VIEWS
-- ==============================================

-- First, let's see what views exist and their definitions
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

-- Drop ALL possible variations of these views
DROP VIEW IF EXISTS app_details_with_stats CASCADE;
DROP VIEW IF EXISTS company_tenant_info CASCADE;
DROP VIEW IF EXISTS public.app_details_with_stats CASCADE;
DROP VIEW IF EXISTS public.company_tenant_info CASCADE;

-- Also drop any functions that might be recreating these views
DROP FUNCTION IF EXISTS create_app_details_view();
DROP FUNCTION IF EXISTS create_company_tenant_view();

-- Now recreate the views explicitly WITHOUT SECURITY DEFINER
-- Using explicit schema references to avoid any issues

-- Recreate app_details_with_stats
CREATE VIEW public.app_details_with_stats AS
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
    FROM public.get_app_statistics(a.company_id, a.app_type)
  ), 0) as record_count,
  COALESCE((
    SELECT user_count 
    FROM public.get_app_statistics(a.company_id, a.app_type)
  ), 0) as user_count
FROM public.apps_enhanced a
JOIN public.companies c ON a.company_id = c.id;

-- Recreate company_tenant_info
CREATE VIEW public.company_tenant_info AS
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
FROM public.companies c
LEFT JOIN public.tenant_configurations tc ON c.id = tc.company_id;

-- Grant access to views
GRANT SELECT ON public.app_details_with_stats TO authenticated;
GRANT SELECT ON public.company_tenant_info TO authenticated;

-- Verify the fix - check if views have SECURITY DEFINER
SELECT 
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN 'NEEDS FIX'
    ELSE 'FIXED'
  END as status
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

-- Also check if there are any triggers or functions that might be recreating these views
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%view%' 
OR action_statement LIKE '%app_details_with_stats%'
OR action_statement LIKE '%company_tenant_info%';

SELECT '✅ Aggressive security definer fix applied!' as status; 