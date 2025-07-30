-- Final Company Users RLS Policy
-- This script creates a secure but functional RLS policy

-- ==============================================
-- STEP 1: DROP THE TEMPORARY POLICY
-- ==============================================

-- Drop the temporary "allow all" policy
DROP POLICY IF EXISTS "allow_all_access" ON company_users;

-- ==============================================
-- STEP 2: CREATE SECURE POLICIES
-- ==============================================

-- Policy 1: Allow admins full access
CREATE POLICY "admin_full_access" ON company_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
    )
  );

-- Policy 2: Allow users to view their own records
CREATE POLICY "user_own_records" ON company_users
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Policy 3: Allow users to view records for their company
CREATE POLICY "user_company_records" ON company_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_users cu2
      WHERE cu2.user_id = auth.uid()
      AND cu2.company_id = company_users.company_id
      AND cu2.status = 'Active'
    )
  );

-- ==============================================
-- STEP 3: VERIFICATION
-- ==============================================

-- Show the final policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'company_users'
ORDER BY policyname;

-- Test the query that was failing
SELECT 'Final test:' AS test_name,
       company_id,
       user_id,
       role,
       status
FROM company_users 
WHERE user_id = '8d3a8ac9-14fd-4761-b273-44191e9bab5c'; 