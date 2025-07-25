-- Test script to assign some items to current user for testing the filtering
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- Get your current user ID (run this in your browser console if needed)
-- const { data: { user } } = await supabase.auth.getUser(); console.log(user.id);

-- Example: Assign some formulas to a user (replace with actual user ID)
-- UPDATE formulas 
-- SET assigned_to = ARRAY['your-user-id-here']::UUID[]
-- WHERE id IN ('FORM001', 'FORM002');

-- Example: Assign some raw materials to a user (replace with actual user ID)
-- UPDATE raw_materials 
-- SET assigned_to = ARRAY['your-user-id-here']::UUID[]
-- WHERE id IN (SELECT id FROM raw_materials LIMIT 2);

-- Verify the assignments
SELECT 
  'formulas' as table_name,
  id,
  name as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM formulas 
WHERE array_length(assigned_to, 1) > 0;

SELECT 
  'raw_materials' as table_name,
  id,
  material_name as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM raw_materials 
WHERE array_length(assigned_to, 1) > 0; 