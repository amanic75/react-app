-- Fix RLS Performance Issues
-- This script optimizes RLS policies by wrapping auth function calls in SELECT statements
-- to prevent re-evaluation for each row

-- ==============================================
-- ENSURE HELPER FUNCTIONS EXIST
-- ==============================================

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'Employee'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user is assigned to a record
CREATE OR REPLACE FUNCTION public.is_assigned_to_record(assigned_to_array UUID[])
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = ANY($1) OR $1 IS NULL OR array_length($1, 1) IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get user's company ID
CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
  SELECT company_id 
  FROM company_users 
  WHERE user_id = auth.uid() 
  AND status = 'Active'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to check if user can manage specific company
CREATE OR REPLACE FUNCTION public.can_manage_company(company_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.company_id = $1
    AND cu.role IN ('Admin', 'Manager')
    AND cu.status = 'Active'
  ) OR public.user_role() IN ('NSight Admin', 'Capacity Admin');
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_to_record(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_company_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_company(UUID) TO authenticated;

-- ==============================================
-- RAW MATERIALS POLICIES
-- ==============================================

-- Update raw materials policies
DROP POLICY IF EXISTS "Users can update assigned raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete their own raw materials" ON raw_materials;

CREATE POLICY "Users can update their own raw materials" ON raw_materials
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own raw materials" ON raw_materials
  FOR DELETE USING (
    created_by = auth.uid() OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- FORMULAS POLICIES
-- ==============================================

-- Update formulas policies
DROP POLICY IF EXISTS "Users can update assigned formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;

CREATE POLICY "Users can update their own formulas" ON formulas
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own formulas" ON formulas
  FOR DELETE USING (
    created_by = auth.uid() OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- SUPPLIERS POLICIES
-- ==============================================

-- Update suppliers policies
DROP POLICY IF EXISTS "Users can update assigned suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can update their own suppliers" ON suppliers
  FOR UPDATE USING (
    created_by = auth.uid() OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own suppliers" ON suppliers
  FOR DELETE USING (
    created_by = auth.uid() OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- USER PROFILES POLICIES
-- ==============================================

-- Update user profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON user_profiles;

CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can delete user profiles" ON user_profiles
  FOR DELETE USING ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- COMPANIES POLICIES
-- ==============================================

-- Update companies policies
DROP POLICY IF EXISTS "Admins can view companies" ON companies;
DROP POLICY IF EXISTS "NSight admins can manage companies" ON companies;
DROP POLICY IF EXISTS "companies_nsight_admin_policy" ON companies;

CREATE POLICY "companies_nsight_admin_policy" ON companies
  FOR ALL USING ((SELECT public.user_role()) = 'NSight Admin');

-- ==============================================
-- COMPANY APPS POLICIES
-- ==============================================

-- Update company apps policies
DROP POLICY IF EXISTS "Company admins can manage company apps" ON company_apps;
DROP POLICY IF EXISTS "Users can view company apps" ON company_apps;
DROP POLICY IF EXISTS "company_apps_nsight_admin_policy" ON company_apps;

CREATE POLICY "company_apps_nsight_admin_policy" ON company_apps
  FOR ALL USING ((SELECT public.user_role()) = 'NSight Admin');

-- ==============================================
-- USER ACTIVITY POLICIES
-- ==============================================

-- Update user activity policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity;
DROP POLICY IF EXISTS "Service role can manage user activity" ON user_activity;
DROP POLICY IF EXISTS "Authenticated users can view user activity" ON user_activity;

CREATE POLICY "Service role can manage user activity" ON user_activity
  FOR ALL USING (true);

CREATE POLICY "Authenticated users can view user activity" ON user_activity
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = auth.uid()) OR 
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- LOGIN EVENTS POLICIES
-- ==============================================

-- Update login events policies
DROP POLICY IF EXISTS "Users can view own login events" ON login_events;
DROP POLICY IF EXISTS "Admins can view all login events" ON login_events;

CREATE POLICY "Users can view own login events" ON login_events
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can view all login events" ON login_events
  FOR SELECT USING ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- TENANT CONFIGURATIONS POLICIES
-- ==============================================

-- Update tenant configurations policies
DROP POLICY IF EXISTS "NSight Admins can manage tenant configurations" ON tenant_configurations;

CREATE POLICY "NSight Admins can manage tenant configurations" ON tenant_configurations
  FOR ALL USING ((SELECT public.user_role()) = 'NSight Admin');

-- ==============================================
-- APPS POLICIES
-- ==============================================

-- Update apps policies
DROP POLICY IF EXISTS "Apps are viewable by company members" ON apps;
DROP POLICY IF EXISTS "Apps are insertable by admin users" ON apps;
DROP POLICY IF EXISTS "Apps are updatable by admin users" ON apps;

CREATE POLICY "Apps are viewable by company members" ON apps
  FOR SELECT USING (true);

CREATE POLICY "Apps are insertable by admin users" ON apps
  FOR INSERT WITH CHECK ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

CREATE POLICY "Apps are updatable by admin users" ON apps
  FOR UPDATE USING ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- APP DATA POLICIES
-- ==============================================

-- Update app data policies
DROP POLICY IF EXISTS "App data is viewable by users with app access" ON app_data;
DROP POLICY IF EXISTS "App data is insertable by users with create permissions" ON app_data;

CREATE POLICY "App data is viewable by users with app access" ON app_data
  FOR SELECT USING (true);

CREATE POLICY "App data is insertable by users with create permissions" ON app_data
  FOR INSERT WITH CHECK ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- APP PERMISSIONS POLICIES
-- ==============================================

-- Update app permissions policies
DROP POLICY IF EXISTS "App permissions are viewable by admin users" ON app_permissions;

CREATE POLICY "App permissions are viewable by admin users" ON app_permissions
  FOR SELECT USING ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- COMPANY USERS POLICIES
-- ==============================================

-- Update company users policies
DROP POLICY IF EXISTS "Company admins can manage company users" ON company_users;
DROP POLICY IF EXISTS "Users can view company users" ON company_users;
DROP POLICY IF EXISTS "company_users_nsight_admin_policy" ON company_users;

CREATE POLICY "company_users_nsight_admin_policy" ON company_users
  FOR ALL USING ((SELECT public.user_role()) = 'NSight Admin');

-- ==============================================
-- REMOVE DUPLICATE POLICIES
-- ==============================================

-- Remove duplicate policies that are causing multiple permissive policies warnings
DROP POLICY IF EXISTS "Allow all formulas operations" ON formulas;
DROP POLICY IF EXISTS "Users can view company_users for their company" ON company_users;
DROP POLICY IF EXISTS "Admins can manage company apps" ON apps_enhanced;
DROP POLICY IF EXISTS "Users can view company apps" ON apps_enhanced; 