-- Fix Final Performance Warnings
-- This script addresses the last 8 multiple permissive policy warnings

-- ==============================================
-- FIX LOGIN_EVENTS DUPLICATE POLICIES
-- ==============================================

-- Remove the duplicate policies that are causing multiple permissive warnings
DROP POLICY IF EXISTS "Admins can view all login events" ON login_events;
DROP POLICY IF EXISTS "Users can view own login events" ON login_events;

-- Create a single consolidated policy that handles both user and admin access
CREATE POLICY "login_events_consolidated_policy" ON login_events
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid())) OR 
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- ==============================================
-- FIX USER_ACTIVITY DUPLICATE POLICIES
-- ==============================================

-- Remove the duplicate policies that are causing multiple permissive warnings
DROP POLICY IF EXISTS "Authenticated users can view user activity" ON user_activity;
DROP POLICY IF EXISTS "Service role can manage user activity" ON user_activity;

-- Create a single consolidated policy that handles both user and admin access
CREATE POLICY "user_activity_consolidated_policy" ON user_activity
  FOR SELECT USING (
    user_email = (SELECT email FROM user_profiles WHERE id = (SELECT auth.uid())) OR 
    (SELECT public.user_role()) IN ('NSight Admin', 'Capacity Admin')
  );

-- Create a separate policy for service role to manage (insert/update/delete)
CREATE POLICY "user_activity_service_policy" ON user_activity
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- VERIFICATION
-- ==============================================

-- This script consolidates the remaining duplicate policies:
-- 1. login_events: Combines "Admins can view all login events" and "Users can view own login events"
-- 2. user_activity: Combines "Authenticated users can view user activity" and "Service role can manage user activity"

-- Expected results:
-- - All 8 remaining multiple permissive policy warnings should be resolved
-- - Security logic remains intact (users can see their own data, admins can see all)
-- - Service role maintains full access for system operations
-- - Query performance improved by reducing policy evaluation overhead 