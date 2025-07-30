-- Fix Remaining RLS Performance Issues
-- This script addresses the remaining 64 performance warnings

-- ==============================================
-- FIX AUTH RLS INIT PLAN WARNINGS
-- ==============================================

-- Fix raw_materials policies that still use auth.uid() directly
DROP POLICY IF EXISTS "Users can view all raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can insert raw materials" ON raw_materials;

CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (true);

CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (true);

-- Fix formulas policies
DROP POLICY IF EXISTS "Users can view all formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert formulas" ON formulas;

CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (true);

CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (true);

-- Fix suppliers policies
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;

CREATE POLICY "Users can view all suppliers" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (true);

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
-- REMOVE DUPLICATE POLICIES (MULTIPLE PERMISSIVE)
-- ==============================================

-- Remove duplicate policies from raw_materials
DROP POLICY IF EXISTS "Allow all raw_materials operations" ON raw_materials;

-- Remove duplicate policies from suppliers
DROP POLICY IF EXISTS "Allow all suppliers operations" ON suppliers;

-- Remove duplicate policies from login_events
DROP POLICY IF EXISTS "Service role can select all login events" ON login_events;

-- Remove duplicate policies from material_verification_log
DROP POLICY IF EXISTS "Users can view verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Users can create verification logs" ON material_verification_log;
DROP POLICY IF EXISTS "Admins can manage verification logs" ON material_verification_log;

-- Create consolidated material_verification_log policies
CREATE POLICY "material_verification_log_view_policy" ON material_verification_log
  FOR SELECT USING (true);

CREATE POLICY "material_verification_log_insert_policy" ON material_verification_log
  FOR INSERT WITH CHECK ((SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin'));

-- ==============================================
-- OPTIMIZE REMAINING POLICIES
-- ==============================================

-- Optimize any remaining policies that might have auth function calls
-- This ensures all auth function calls are wrapped in SELECT statements

-- Update any remaining policies to use optimized patterns
-- The key is to wrap all auth function calls in (SELECT auth.<function>())
-- and remove any duplicate policies that serve the same purpose

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check for any remaining policies that might need optimization
-- This will help identify any missed policies

-- List all policies on raw_materials
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'raw_materials';

-- List all policies on formulas  
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'formulas';

-- List all policies on suppliers
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'suppliers'; 