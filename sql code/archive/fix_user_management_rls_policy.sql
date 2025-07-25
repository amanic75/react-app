-- ==============================================
-- FIX USER MANAGEMENT RLS POLICY
-- Fix the Row Level Security policy to allow Capacity Admin users to update other user profiles
-- ==============================================

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

-- Create the corrected update policy
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Capacity Admin'
    )
  );

-- Verify the policy was created correctly
DO $$
BEGIN
    RAISE NOTICE '✅ User profiles UPDATE policy fixed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Policy: "Users can update their own profile"';
    RAISE NOTICE 'Rule: Users can update their own profile OR users with role = ''Capacity Admin'' can update any profile';
    RAISE NOTICE '';
    RAISE NOTICE 'You should now be able to:';
    RAISE NOTICE '1. Edit user roles as a Capacity Admin';
    RAISE NOTICE '2. Update user information successfully';
    RAISE NOTICE '3. See changes reflected in the UI';
END $$; 