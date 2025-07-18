-- ==============================================
-- ADD APP ACCESS FIELD TO USER PROFILES
-- Run this in your Supabase SQL Editor to add app access storage
-- ==============================================

-- Add app_access field to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS app_access JSONB DEFAULT '[]'::jsonb;

-- Update existing users to have default app access based on their role
UPDATE user_profiles 
SET app_access = CASE 
    WHEN role = 'Capacity Admin' THEN '["formulas", "suppliers", "raw-materials"]'::jsonb
    WHEN role = 'NSight Admin' THEN '["developer-mode", "existing-company-mode"]'::jsonb
    WHEN role = 'Employee' THEN '["formulas"]'::jsonb
    ELSE '["formulas"]'::jsonb
END
WHERE app_access = '[]'::jsonb OR app_access IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_app_access ON user_profiles USING GIN(app_access);

-- Verify the changes
SELECT 
    email,
    role,
    app_access,
    created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ App access field added successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'The user_profiles table now has:';
    RAISE NOTICE '- app_access JSONB field for storing custom app permissions';
    RAISE NOTICE '- Default app access assigned based on existing roles';
    RAISE NOTICE '- GIN index for efficient JSON queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Users can now have custom app access that persists!';
END $$; 