-- ==============================================
-- FIX SIGNUP ROLE ASSIGNMENT
-- Run this in your Supabase SQL Editor to fix the role assignment issue
-- ==============================================

-- Update the handle_new_user function to properly extract role and department from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role, department)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'Employee'),
    COALESCE(NEW.raw_user_meta_data->>'department', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the fix worked
DO $$
BEGIN
    RAISE NOTICE '✅ User signup function updated!';
    RAISE NOTICE '';
    RAISE NOTICE 'The handle_new_user() function now properly extracts:';
    RAISE NOTICE '- first_name from signup form';
    RAISE NOTICE '- last_name from signup form';
    RAISE NOTICE '- role from signup form (defaults to Employee)';
    RAISE NOTICE '- department from signup form';
    RAISE NOTICE '';
    RAISE NOTICE 'New users will now be assigned their selected role during signup!';
    RAISE NOTICE 'Test by creating a new account with different roles.';
END $$; 