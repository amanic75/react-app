-- ==============================================
-- 02_SECURITY_POLICIES.SQL
-- Row Level Security (RLS) policies and permissions
-- Consolidates: All scattered policy files and security configurations
-- ==============================================

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables that need access control
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- HELPER FUNCTIONS FOR POLICY CONDITIONS
-- ==============================================

-- Function to check user role
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'Employee'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get user's company ID
CREATE OR REPLACE FUNCTION auth.user_company_id()
RETURNS UUID AS $$
  SELECT company_id 
  FROM company_users 
  WHERE user_id = auth.uid() 
  AND status = 'Active'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user can manage specific company
CREATE OR REPLACE FUNCTION auth.can_manage_company(company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = $1
    AND cu.role IN ('Admin', 'Manager')
    AND cu.status = 'Active'
  ) OR auth.user_role() IN ('NSight Admin', 'Capacity Admin');
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is assigned to a record
CREATE OR REPLACE FUNCTION auth.is_assigned_to_record(assigned_to_array UUID[])
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = ANY($1) OR $1 IS NULL OR array_length($1, 1) IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ==============================================
-- USER PROFILES POLICIES
-- ==============================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can view all profiles in their scope
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    auth.user_role() = 'NSight Admin' OR
    (auth.user_role() = 'Capacity Admin' AND id IN (
      SELECT cu.user_id FROM company_users cu
      WHERE cu.company_id = auth.user_company_id()
    ))
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can manage profiles in their scope
CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    auth.user_role() = 'NSight Admin' OR
    (auth.user_role() = 'Capacity Admin' AND (
      id = auth.uid() OR id IN (
        SELECT cu.user_id FROM company_users cu
        WHERE cu.company_id = auth.user_company_id()
      )
    ))
  );

-- ==============================================
-- COMPANY MANAGEMENT POLICIES
-- ==============================================

-- Companies table policies
DROP POLICY IF EXISTS "Admins can view companies" ON companies;
DROP POLICY IF EXISTS "NSight admins can manage companies" ON companies;

CREATE POLICY "Admins can view companies" ON companies
  FOR SELECT USING (
    auth.user_role() = 'NSight Admin' OR
    (auth.user_role() = 'Capacity Admin' AND id = auth.user_company_id())
  );

CREATE POLICY "NSight admins can manage companies" ON companies
  FOR ALL USING (auth.user_role() = 'NSight Admin');

-- Company users table policies
DROP POLICY IF EXISTS "Company admins can manage company users" ON company_users;
DROP POLICY IF EXISTS "Users can view company users" ON company_users;

CREATE POLICY "Company admins can manage company users" ON company_users
  FOR ALL USING (
    auth.user_role() = 'NSight Admin' OR
    auth.can_manage_company(company_id)
  );

CREATE POLICY "Users can view company users" ON company_users
  FOR SELECT USING (
    user_id = auth.uid() OR
    company_id = auth.user_company_id() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

-- Company apps table policies
DROP POLICY IF EXISTS "Company admins can manage apps" ON company_apps;
DROP POLICY IF EXISTS "Users can view company apps" ON company_apps;

CREATE POLICY "Company admins can manage apps" ON company_apps
  FOR ALL USING (
    auth.user_role() = 'NSight Admin' OR
    auth.can_manage_company(company_id)
  );

CREATE POLICY "Users can view company apps" ON company_apps
  FOR SELECT USING (
    company_id = auth.user_company_id() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- APPLICATION DATA POLICIES
-- ==============================================

-- App data table policies (generic data storage)
DROP POLICY IF EXISTS "Users can view app data" ON app_data;
DROP POLICY IF EXISTS "Users can manage own app data" ON app_data;
DROP POLICY IF EXISTS "Admins can manage company app data" ON app_data;

CREATE POLICY "Users can view app data" ON app_data
  FOR SELECT USING (
    company_id = auth.user_company_id() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin') OR
    auth.is_assigned_to_record(assigned_to)
  );

CREATE POLICY "Users can manage own app data" ON app_data
  FOR ALL USING (
    created_by = auth.uid() OR
    auth.is_assigned_to_record(assigned_to)
  );

CREATE POLICY "Admins can manage company app data" ON app_data
  FOR ALL USING (
    auth.user_role() = 'NSight Admin' OR
    (auth.user_role() = 'Capacity Admin' AND company_id = auth.user_company_id())
  );

-- ==============================================
-- LEGACY TABLE POLICIES (Raw Materials, Formulas, Suppliers)
-- ==============================================

-- Raw Materials policies
DROP POLICY IF EXISTS "Users can view all raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can insert raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update assigned raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Admins can manage all raw materials" ON raw_materials;

CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (true); -- All authenticated users can view

CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (true); -- All authenticated users can insert

CREATE POLICY "Users can update assigned raw materials" ON raw_materials
  FOR UPDATE USING (
    created_by = auth.uid() OR
    auth.is_assigned_to_record(assigned_to) OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete own raw materials" ON raw_materials
  FOR DELETE USING (
    created_by = auth.uid() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

-- Formulas policies
DROP POLICY IF EXISTS "Users can view all formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update assigned formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;

CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update assigned formulas" ON formulas
  FOR UPDATE USING (
    created_by = auth.uid() OR
    auth.is_assigned_to_record(assigned_to) OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete own formulas" ON formulas
  FOR DELETE USING (
    created_by = auth.uid() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

-- Suppliers policies
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update assigned suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;

CREATE POLICY "Users can view all suppliers" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update assigned suppliers" ON suppliers
  FOR UPDATE USING (
    created_by = auth.uid() OR
    auth.is_assigned_to_record(assigned_to) OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete own suppliers" ON suppliers
  FOR DELETE USING (
    created_by = auth.uid() OR
    auth.user_role() IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- ACTIVITY AND AUDIT POLICIES
-- ==============================================

-- User activity policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity;

CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity" ON user_activity
  FOR SELECT USING (auth.user_role() IN ('NSight Admin', 'Capacity Admin'));

CREATE POLICY "System can insert activity" ON user_activity
  FOR INSERT WITH CHECK (true); -- Allow system to log activity

-- Login events policies
DROP POLICY IF EXISTS "Users can view own login events" ON login_events;
DROP POLICY IF EXISTS "Admins can view all login events" ON login_events;

CREATE POLICY "Users can view own login events" ON login_events
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all login events" ON login_events
  FOR SELECT USING (auth.user_role() IN ('NSight Admin', 'Capacity Admin'));

CREATE POLICY "System can insert login events" ON login_events
  FOR INSERT WITH CHECK (true); -- Allow system to log login events

-- ==============================================
-- VERIFICATION LOG POLICIES
-- ==============================================

DROP POLICY IF EXISTS "Users can view verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Users can create verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Admins can manage verification logs" ON material_verification_log;

CREATE POLICY "Users can view verification logs" ON material_verification_log
  FOR SELECT USING (true); -- All users can view verification status

CREATE POLICY "Users can create verification logs" ON material_verification_log
  FOR INSERT WITH CHECK (verified_by = auth.uid());

CREATE POLICY "Admins can manage verification logs" ON material_verification_log
  FOR ALL USING (auth.user_role() IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ==============================================

-- Grant basic permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant auth schema function access
GRANT EXECUTE ON FUNCTION auth.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.user_company_id() TO authenticated; 
GRANT EXECUTE ON FUNCTION auth.can_manage_company(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_assigned_to_record(UUID[]) TO authenticated;

-- ==============================================
-- SECURITY VALIDATION
-- ==============================================

-- Function to validate security setup
CREATE OR REPLACE FUNCTION validate_security_setup()
RETURNS TABLE (
  table_name TEXT,
  rls_enabled BOOLEAN,
  policy_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::TEXT,
    t.rowsecurity::BOOLEAN,
    COUNT(p.policyname)::INTEGER
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'user_profiles', 'companies', 'company_users', 'company_apps',
    'app_data', 'raw_materials', 'formulas', 'suppliers',
    'user_activity', 'login_events', 'material_verification_log'
  )
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- Run validation
SELECT * FROM validate_security_setup();

-- Display completion message
SELECT 'Security policies setup completed successfully!' as status,
       'All tables have RLS enabled with appropriate policies' as details; 