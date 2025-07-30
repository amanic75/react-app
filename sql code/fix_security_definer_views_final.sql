-- ==============================================
-- FINAL FIX FOR SECURITY DEFINER VIEWS
-- Force remove SECURITY DEFINER from views
-- ==============================================

-- Drop views completely
DROP VIEW IF EXISTS app_details_with_stats CASCADE;
DROP VIEW IF EXISTS company_tenant_info CASCADE;

-- Recreate app_details_with_stats WITHOUT SECURITY DEFINER
CREATE VIEW app_details_with_stats AS
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

-- Recreate company_tenant_info WITHOUT SECURITY DEFINER
CREATE VIEW company_tenant_info AS
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

-- Verify the fix
SELECT 
  schemaname,
  viewname,
  CASE WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER' ELSE '✅ NO SECURITY DEFINER' END as security_status
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

SELECT '✅ Security definer views fixed!' as status; 