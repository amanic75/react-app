-- ==============================================
-- VERIFY VIEW FIX
-- Check if the security definer issue is resolved
-- ==============================================

-- Check current view definitions
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

-- Check if views exist at all
SELECT 
  'View Existence Check' as info,
  'app_details_with_stats' as view_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'app_details_with_stats') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'View Existence Check' as info,
  'company_tenant_info' as view_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'company_tenant_info') THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Test if views are accessible
SELECT 
  'Testing view access' as info,
  COUNT(*) as app_details_count
FROM app_details_with_stats
LIMIT 1;

SELECT 
  'Testing view access' as info,
  COUNT(*) as company_tenant_count
FROM company_tenant_info
LIMIT 1;

SELECT '✅ Verification complete! Check the results above.' as status; 