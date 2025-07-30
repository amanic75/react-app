-- ==============================================
-- CHECK VIEW STATUS
-- See what's actually happening with the views
-- ==============================================

-- Check if the views exist and their current definitions
SELECT 
  'Current View Status' as info,
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

-- Check if there are any functions that might be recreating these views
SELECT 
  'Functions that reference these views' as info,
  p.proname as function_name,
  CASE 
    WHEN p.prosrc LIKE '%app_details_with_stats%' THEN 'References app_details_with_stats'
    WHEN p.prosrc LIKE '%company_tenant_info%' THEN 'References company_tenant_info'
    ELSE 'Other'
  END as reference_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND (p.prosrc LIKE '%app_details_with_stats%' OR p.prosrc LIKE '%company_tenant_info%');

-- Check if there are any other schemas with these views
SELECT 
  'Views in other schemas' as info,
  schemaname,
  viewname
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info');

-- Check if the views are actually being used
SELECT 
  'View usage check' as info,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'app_details_with_stats') THEN 'app_details_with_stats EXISTS'
    ELSE 'app_details_with_stats MISSING'
  END as app_details_status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'company_tenant_info') THEN 'company_tenant_info EXISTS'
    ELSE 'company_tenant_info MISSING'
  END as company_tenant_status;

SELECT '📊 View status check complete!' as status; 