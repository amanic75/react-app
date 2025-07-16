-- Final fix for app creation and statistics - works with existing company_apps structure

-- 1. First, let's see what tables we have
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('apps', 'company_apps')
ORDER BY table_name;

-- 2. Create a new apps table for the enhanced system
CREATE TABLE IF NOT EXISTS apps_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  app_name VARCHAR(255) NOT NULL,
  app_type VARCHAR(50) NOT NULL, -- 'formulas', 'raw-materials', 'suppliers', etc.
  app_description TEXT,
  app_icon VARCHAR(50),
  app_color VARCHAR(7),
  configuration JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_enhanced_company_id ON apps_enhanced(company_id);
CREATE INDEX IF NOT EXISTS idx_apps_enhanced_app_type ON apps_enhanced(app_type);

-- 3. Create function to get app statistics
CREATE OR REPLACE FUNCTION get_app_statistics(p_company_id UUID, p_app_type VARCHAR)
RETURNS TABLE(
  record_count BIGINT,
  user_count BIGINT
) AS $$
DECLARE
  v_record_count BIGINT;
  v_user_count BIGINT;
BEGIN
  -- Get record count based on app type
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

  -- Get user count (users who have access to this app type)
  SELECT COUNT(DISTINCT cu.user_id) INTO v_user_count
  FROM company_users cu
  JOIN user_profiles up ON cu.user_id = up.id
  WHERE cu.company_id = p_company_id
  AND cu.status = 'Active'
  AND (
    p_app_type = ANY(up.app_access) 
    OR cu.role = 'Admin' -- Admins have access to all apps
  );

  record_count := v_record_count;
  user_count := v_user_count;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- 4. Migrate existing company_apps to apps_enhanced table
INSERT INTO apps_enhanced (company_id, app_name, app_type, app_description, app_icon, app_color, status)
SELECT DISTINCT
  ca.company_id,
  ca.app_name,
  ca.app_id as app_type,
  CASE ca.app_id
    WHEN 'formulas' THEN 'Chemical formula management system'
    WHEN 'raw-materials' THEN 'Raw material inventory management'
    WHEN 'suppliers' THEN 'Supplier relationship management'
    ELSE ca.app_name
  END as app_description,
  CASE ca.app_id
    WHEN 'formulas' THEN 'Database'
    WHEN 'raw-materials' THEN 'FlaskConical'
    WHEN 'suppliers' THEN 'Users'
    ELSE 'Database'
  END as app_icon,
  CASE ca.app_id
    WHEN 'formulas' THEN '#10B981'
    WHEN 'raw-materials' THEN '#F59E0B'
    WHEN 'suppliers' THEN '#8B5CF6'
    ELSE '#3B82F6'
  END as app_color,
  CASE WHEN ca.enabled THEN 'active' ELSE 'inactive' END as status
FROM company_apps ca
WHERE NOT EXISTS (
  SELECT 1 FROM apps_enhanced a 
  WHERE a.company_id = ca.company_id 
  AND a.app_type = ca.app_id
);

-- 5. Create view for app details with statistics
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

-- 6. Show the results
SELECT 
  company_name,
  app_name,
  app_type,
  record_count,
  user_count,
  status
FROM app_details_with_stats
ORDER BY company_name, app_name;

-- 7. Also show the original company_apps for comparison
SELECT 
  c.company_name,
  ca.app_name,
  ca.app_id,
  ca.enabled,
  ca.deployed_at
FROM companies c
JOIN company_apps ca ON c.id = ca.company_id
ORDER BY c.company_name, ca.app_name; 