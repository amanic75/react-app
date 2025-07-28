-- Fix raw_materials app access format and remove duplicates
-- This script standardizes the app access to use 'raw-materials' (with hyphen)

-- First, let's see the current state
SELECT 
  up.id,
  up.email,
  up.role,
  up.app_access,
  up.app_access::text as app_access_text
FROM user_profiles up
WHERE up.role = 'Employee';

-- Remove 'raw_materials' (without hyphen) and ensure 'raw-materials' (with hyphen) exists
UPDATE user_profiles 
SET app_access = CASE 
  WHEN app_access @> '["raw_materials"]' AND NOT (app_access @> '["raw-materials"]') THEN
    (app_access - 'raw_materials') || '["raw-materials"]'::jsonb
  WHEN app_access @> '["raw_materials"]' AND app_access @> '["raw-materials"]' THEN
    app_access - 'raw_materials'
  ELSE app_access
END
WHERE role = 'Employee' 
AND app_access @> '["raw_materials"]';

-- Verify the changes
SELECT 
  up.id,
  up.email,
  up.role,
  up.app_access,
  up.app_access::text as app_access_text
FROM user_profiles up
WHERE up.role = 'Employee'; 