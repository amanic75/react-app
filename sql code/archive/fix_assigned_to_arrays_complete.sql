-- Complete fix for assigned_to array conversion
-- This script ensures assigned_to columns are properly converted to UUID arrays
-- and handles all edge cases including null values, empty arrays, and validation

-- ==========================================
-- STEP 1: Check current state of assigned_to columns
-- ==========================================

-- Check raw_materials table structure
SELECT 
  'raw_materials' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'raw_materials' AND column_name = 'assigned_to';

-- Check formulas table structure
SELECT 
  'formulas' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'formulas' AND column_name = 'assigned_to';

-- Check suppliers table structure
SELECT 
  'suppliers' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'suppliers' AND column_name = 'assigned_to';

-- ==========================================
-- STEP 2: Drop existing constraints and triggers
-- ==========================================

-- Drop foreign key constraints if they exist
ALTER TABLE raw_materials DROP CONSTRAINT IF EXISTS raw_materials_assigned_to_fkey;
ALTER TABLE formulas DROP CONSTRAINT IF EXISTS formulas_assigned_to_fkey;
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_assigned_to_fkey;

-- Drop existing triggers
DROP TRIGGER IF EXISTS validate_raw_materials_assigned_users ON raw_materials;
DROP TRIGGER IF EXISTS validate_formulas_assigned_users ON formulas;
DROP TRIGGER IF EXISTS validate_suppliers_assigned_users ON suppliers;

-- Drop ALL existing policies that might reference assigned_to or need to be updated
DROP POLICY IF EXISTS "Users can view all raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can insert raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can view all formulas" ON formulas;
DROP POLICY IF EXISTS "Users can insert formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

-- ==========================================
-- STEP 3: Convert assigned_to columns to UUID arrays
-- ==========================================

-- Convert raw_materials.assigned_to to UUID[] if it's not already
DO $$
BEGIN
  -- Check if column exists and its type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'raw_materials' 
    AND column_name = 'assigned_to'
    AND data_type != 'ARRAY'
  ) THEN
    -- Convert UUID to UUID[]
    ALTER TABLE raw_materials 
    ALTER COLUMN assigned_to TYPE UUID[] USING 
      CASE 
        WHEN assigned_to IS NULL THEN '{}'::UUID[]
        ELSE ARRAY[assigned_to]::UUID[]
      END;
    RAISE NOTICE '✅ Converted raw_materials.assigned_to from UUID to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ raw_materials.assigned_to is already UUID[] or does not exist';
  END IF;
END $$;

-- Convert formulas.assigned_to to UUID[] if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'formulas' 
    AND column_name = 'assigned_to'
    AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE formulas 
    ALTER COLUMN assigned_to TYPE UUID[] USING 
      CASE 
        WHEN assigned_to IS NULL THEN '{}'::UUID[]
        ELSE ARRAY[assigned_to]::UUID[]
      END;
    RAISE NOTICE '✅ Converted formulas.assigned_to from UUID to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ formulas.assigned_to is already UUID[] or does not exist';
  END IF;
END $$;

-- Convert suppliers.assigned_to to UUID[] if it's not already
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' 
    AND column_name = 'assigned_to'
    AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE suppliers 
    ALTER COLUMN assigned_to TYPE UUID[] USING 
      CASE 
        WHEN assigned_to IS NULL THEN '{}'::UUID[]
        ELSE ARRAY[assigned_to]::UUID[]
      END;
    RAISE NOTICE '✅ Converted suppliers.assigned_to from UUID to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ suppliers.assigned_to is already UUID[] or does not exist';
  END IF;
END $$;

-- ==========================================
-- STEP 4: Create GIN indexes for better performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_raw_materials_assigned_to ON raw_materials USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_formulas_assigned_to ON formulas USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suppliers_assigned_to ON suppliers USING GIN(assigned_to);

-- ==========================================
-- STEP 5: Create validation function
-- ==========================================

CREATE OR REPLACE FUNCTION validate_assigned_users() RETURNS TRIGGER AS $$
BEGIN
  -- Check if all assigned user IDs exist in auth.users
  IF NEW.assigned_to IS NOT NULL AND array_length(NEW.assigned_to, 1) > 0 THEN
    IF EXISTS (
      SELECT 1 
      FROM unnest(NEW.assigned_to) AS user_id
      WHERE NOT EXISTS (
        SELECT 1 FROM auth.users WHERE id = user_id
      )
    ) THEN
      RAISE EXCEPTION 'One or more assigned user IDs do not exist in auth.users';
    END IF;
  END IF;
  
  -- Clean up any null values in the array
  IF NEW.assigned_to IS NOT NULL THEN
    NEW.assigned_to := ARRAY(SELECT unnest(NEW.assigned_to) WHERE unnest(NEW.assigned_to) IS NOT NULL);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- STEP 6: Create triggers for validation
-- ==========================================

CREATE TRIGGER validate_raw_materials_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON raw_materials
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

CREATE TRIGGER validate_formulas_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON formulas
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

CREATE TRIGGER validate_suppliers_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON suppliers
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

-- ==========================================
-- STEP 7: Update RLS policies to work with arrays
-- ==========================================

-- Raw Materials policies
CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own raw materials" ON raw_materials
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to) OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

CREATE POLICY "Users can delete their own raw materials" ON raw_materials
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

-- Formulas policies
CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own formulas" ON formulas
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to) OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

CREATE POLICY "Users can delete their own formulas" ON formulas
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

-- Suppliers policies (if RLS is enabled)
DO $$ 
BEGIN
  -- Check if suppliers table has RLS enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'suppliers' 
    AND schemaname = 'public'
  ) THEN
    -- Check if RLS is enabled
    IF EXISTS (
      SELECT 1 FROM pg_class 
      WHERE relname = 'suppliers' 
      AND relrowsecurity = true
    ) THEN
      EXECUTE 'CREATE POLICY "Users can view all suppliers" ON suppliers
        FOR SELECT USING (auth.role() = ''authenticated'')';
        
      EXECUTE 'CREATE POLICY "Users can insert suppliers" ON suppliers
        FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
        
      EXECUTE 'CREATE POLICY "Users can update their own suppliers" ON suppliers
        FOR UPDATE USING (
          auth.uid() = created_by OR 
          auth.uid() = ANY(assigned_to) OR
          created_by IS NULL OR
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN (''Capacity Admin'', ''NSight Admin'')
          )
        )';
        
      EXECUTE 'CREATE POLICY "Users can delete their own suppliers" ON suppliers
        FOR DELETE USING (
          auth.uid() = created_by OR
          created_by IS NULL OR
          EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN (''Capacity Admin'', ''NSight Admin'')
          )
        )';
    END IF;
  END IF;
END $$;

-- ==========================================
-- STEP 8: Clean up data and set default values
-- ==========================================

-- Ensure all NULL assigned_to values are converted to empty arrays
UPDATE raw_materials 
SET assigned_to = '{}' 
WHERE assigned_to IS NULL;

UPDATE formulas 
SET assigned_to = '{}' 
WHERE assigned_to IS NULL;

UPDATE suppliers 
SET assigned_to = '{}' 
WHERE assigned_to IS NULL;

-- ==========================================
-- STEP 9: Add helpful comments
-- ==========================================

COMMENT ON COLUMN raw_materials.assigned_to IS 'Array of user IDs (UUID[]) assigned to this raw material';
COMMENT ON COLUMN formulas.assigned_to IS 'Array of user IDs (UUID[]) assigned to this formula';
COMMENT ON COLUMN suppliers.assigned_to IS 'Array of user IDs (UUID[]) assigned to this supplier';

-- ==========================================
-- STEP 10: Verify the changes
-- ==========================================

-- Check the final state of all tables
SELECT 
  'raw_materials' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'raw_materials' AND column_name = 'assigned_to'
UNION ALL
SELECT 
  'formulas' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'formulas' AND column_name = 'assigned_to'
UNION ALL
SELECT 
  'suppliers' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'suppliers' AND column_name = 'assigned_to';

-- Show sample data from each table
SELECT 
  'raw_materials' as table_name,
  id,
  COALESCE(material_name, 'Unknown') as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM raw_materials 
LIMIT 3;

SELECT 
  'formulas' as table_name,
  id,
  COALESCE(name, 'Unknown') as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM formulas 
LIMIT 3;

SELECT 
  'suppliers' as table_name,
  id,
  COALESCE(supplier_name, 'Unknown') as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM suppliers 
LIMIT 3;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '🎉 SUCCESS: assigned_to columns have been converted to UUID arrays!';
  RAISE NOTICE '✅ Foreign key constraints replaced with validation triggers';
  RAISE NOTICE '✅ RLS policies updated to work with arrays';
  RAISE NOTICE '✅ GIN indexes created for better performance';
  RAISE NOTICE '✅ Data cleaned up and validated';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test the "Assigned to me" tab in your React app';
  RAISE NOTICE '2. Check the browser console for debug logs';
  RAISE NOTICE '3. Verify that assignment functionality works correctly';
END $$; 