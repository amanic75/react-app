-- Simple check: Do the views exist and do they have SECURITY DEFINER?

SELECT 'Checking app_details_with_stats view:' as message;
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname = 'app_details_with_stats'
AND schemaname = 'public';

SELECT 'Checking company_tenant_info view:' as message;
SELECT 
  schemaname,
  viewname,
  definition
FROM pg_views 
WHERE viewname = 'company_tenant_info'
AND schemaname = 'public';

SELECT 'Checking if views exist at all:' as message;
SELECT 
  'app_details_with_stats' as view_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'app_details_with_stats') THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
  'company_tenant_info' as view_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'company_tenant_info') THEN 'EXISTS' ELSE 'MISSING' END as status;

SELECT 'Done!' as message; 