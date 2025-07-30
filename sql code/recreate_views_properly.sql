-- ==============================================
-- RECREATE VIEWS PROPERLY
-- The views don't exist, so let's create them correctly
-- ==============================================

-- First, make sure the get_app_statistics function exists
CREATE OR REPLACE FUNCTION get_app_statistics(p_company_id UUID, p_app_type VARCHAR)
RETURNS TABLE(record_count INTEGER, user_count INTEGER)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_record_count INTEGER;
  v_user_count INTEGER;
BEGIN
  IF p_app_type = 'formulas' THEN
    SELECT COUNT(*) INTO v_record_count
    FROM formulas
    WHERE company_id = p_company_id;
  ELSIF p_app_type = 'raw-materials' THEN
    SELECT COUNT(*) INTO v_record_count
    FROM raw_materials
    WHERE company_id = p_company_id;
  ELSIF p_app_type = 'suppliers' THEN
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
  AND cu.status = 'Active'
  AND (
    cu.role = 'Admin'
  );

  record_count := v_record_count;
  user_count := v_user_count;
  RETURN NEXT;
END;
$$;

-- Drop existing views first
DROP VIEW IF EXISTS app_details_with_stats CASCADE;
DROP VIEW IF EXISTS company_tenant_info CASCADE;

-- Now create the views WITHOUT SECURITY DEFINER
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

-- Verify the views were created
SELECT 
  'Views created successfully!' as message,
  schemaname,
  viewname,
  CASE 
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '❌ HAS SECURITY DEFINER'
    ELSE '✅ NO SECURITY DEFINER'
  END as security_status
FROM pg_views 
WHERE viewname IN ('app_details_with_stats', 'company_tenant_info')
AND schemaname = 'public';

SELECT '✅ Views recreated properly!' as status; 