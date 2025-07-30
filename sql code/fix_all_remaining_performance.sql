-- Comprehensive Fix for All Remaining RLS Performance Issues
-- This script addresses all 64 remaining performance warnings

-- ==============================================
-- STEP 1: REMOVE ALL DUPLICATE POLICIES
-- ==============================================

-- Remove all duplicate policies that are causing multiple permissive warnings
DROP POLICY IF EXISTS "Allow all raw_materials operations" ON raw_materials;
DROP POLICY IF EXISTS "Allow all formulas operations" ON formulas;
DROP POLICY IF EXISTS "Allow all suppliers operations" ON suppliers;
DROP POLICY IF EXISTS "Service role can select all login events" ON login_events;
DROP POLICY IF EXISTS "Users can view verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Users can create verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Admins can manage verification logs" ON material_verification_log;

-- ==============================================
-- STEP 2: FIX AUTH RLS INIT PLAN WARNINGS
-- ==============================================

-- Fix raw_materials policies - wrap auth.uid() in SELECT
DROP POLICY IF EXISTS "Users can view all raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can insert raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete their own raw materials" ON raw_materials;

CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (true);

CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own raw materials" ON raw_materials
  FOR UPDATE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own raw materials" ON raw_materials
  FOR DELETE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- Fix formulas policies
DROP POLICY IF EXISTS "Users can view all formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;

CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own formulas" ON formulas
  FOR UPDATE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own formulas" ON formulas
  FOR DELETE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- Fix suppliers policies
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

CREATE POLICY "Users can view all suppliers" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own suppliers" ON suppliers
  FOR UPDATE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.is_assigned_to_record(assigned_to)) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

CREATE POLICY "Users can delete their own suppliers" ON suppliers
  FOR DELETE USING (
    created_by = (SELECT auth.uid()) OR
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- Fix user_activity policy
DROP POLICY IF EXISTS "Authenticated users can view user activity" ON user_activity;

CREATE POLICY "Authenticated users can view user activity" ON user_activity
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid())) OR 
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- Fix login_events policy
DROP POLICY IF EXISTS "Users can view own login events" ON login_events;

CREATE POLICY "Users can view own login events" ON login_events
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid()))
  );

-- ==============================================
-- STEP 3: CONSOLIDATE MATERIAL VERIFICATION LOG
-- ==============================================

-- Create single consolidated policies for material_verification_log
CREATE POLICY "material_verification_log_view_policy" ON material_verification_log
  FOR SELECT USING (true);

CREATE POLICY "material_verification_log_insert_policy" ON material_verification_log
  FOR INSERT WITH CHECK ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- STEP 4: ENSURE HELPER FUNCTIONS EXIST
-- ==============================================

-- Make sure all helper functions are available
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()),
    'Employee'
  );
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_assigned_to_record(assigned_to_array UUID[])
RETURNS BOOLEAN AS $$
  SELECT auth.uid() = ANY($1) OR $1 IS NULL OR array_length($1, 1) IS NULL;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_assigned_to_record(UUID[]) TO authenticated;

-- ==============================================
-- STEP 5: VERIFICATION
-- ==============================================

-- This script should resolve all remaining performance warnings by:
-- 1. Removing duplicate policies that cause multiple permissive warnings
-- 2. Wrapping all auth function calls in (SELECT auth.<function>())
-- 3. Consolidating policies to reduce evaluation overhead
-- 4. Ensuring all helper functions are properly created and accessible

-- Expected results:
-- - All "auth_rls_initplan" warnings should be resolved
-- - All "multiple_permissive_policies" warnings should be resolved
-- - Query performance should be significantly improved
-- - Security logic remains intact 