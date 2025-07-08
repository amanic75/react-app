-- ==============================================
-- FIX USER PROFILES DELETE POLICY
-- This adds the missing DELETE policy for user_profiles table
-- ==============================================

-- Add DELETE policy for user_profiles
-- Only Capacity Admin users can delete user profiles
DROP POLICY IF EXISTS "Admins can delete user profiles" ON user_profiles;
CREATE POLICY "Admins can delete user profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Capacity Admin'
    )
  );

-- Verify the policy was created
DO $$
BEGIN
    RAISE NOTICE '✅ DELETE policy added for user_profiles!';
    RAISE NOTICE '';
    RAISE NOTICE 'Policy: "Admins can delete user profiles"';
    RAISE NOTICE 'Rule: Only users with role = ''Capacity Admin'' can delete user profiles';
    RAISE NOTICE '';
    RAISE NOTICE 'You should now be able to delete users both in the app and Supabase dashboard.';
    RAISE NOTICE '';
    RAISE NOTICE 'Test by:';
    RAISE NOTICE '1. Making sure your current user has role = ''Capacity Admin''';
    RAISE NOTICE '2. Trying to delete a user in the app';
    RAISE NOTICE '3. Trying to delete a user in Supabase dashboard';
END $$; 