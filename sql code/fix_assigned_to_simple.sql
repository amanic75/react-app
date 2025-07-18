-- Simple fix for assigned_to array conversion
-- This is a minimal version that just converts the columns and basic policies

-- ==========================================
-- STEP 1: Check current state
-- ==========================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('raw_materials', 'formulas', 'suppliers') 
AND column_name = 'assigned_to'
ORDER BY table_name;

-- ==========================================
-- STEP 2: Drop policies that reference assigned_to column
-- ==========================================

-- Drop all policies that might reference the assigned_to column
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

-- Drop existing triggers that depend on assigned_to
DROP TRIGGER IF EXISTS validate_raw_materials_assigned_users ON raw_materials;
DROP TRIGGER IF EXISTS validate_formulas_assigned_users ON formulas;
DROP TRIGGER IF EXISTS validate_suppliers_assigned_users ON suppliers;

-- Drop foreign key constraints
ALTER TABLE raw_materials DROP CONSTRAINT IF EXISTS raw_materials_assigned_to_fkey;
ALTER TABLE formulas DROP CONSTRAINT IF EXISTS formulas_assigned_to_fkey;
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_assigned_to_fkey;

-- ==========================================
-- STEP 3: Convert assigned_to columns to UUID arrays
-- ==========================================

-- Convert raw_materials.assigned_to to UUID[]
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'raw_materials' 
    AND column_name = 'assigned_to'
    AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE raw_materials 
    ALTER COLUMN assigned_to TYPE UUID[] USING 
      CASE 
        WHEN assigned_to IS NULL THEN '{}'::UUID[]
        ELSE ARRAY[assigned_to]::UUID[]
      END;
    RAISE NOTICE '✅ Converted raw_materials.assigned_to to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ raw_materials.assigned_to already UUID[] or does not exist';
  END IF;
END $$;

-- Convert formulas.assigned_to to UUID[]
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
    RAISE NOTICE '✅ Converted formulas.assigned_to to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ formulas.assigned_to already UUID[] or does not exist';
  END IF;
END $$;

-- Convert suppliers.assigned_to to UUID[]
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
    RAISE NOTICE '✅ Converted suppliers.assigned_to to UUID[]';
  ELSE
    RAISE NOTICE 'ℹ️ suppliers.assigned_to already UUID[] or does not exist';
  END IF;
END $$;

-- ==========================================
-- STEP 4: Clean up NULL values
-- ==========================================
UPDATE raw_materials SET assigned_to = '{}' WHERE assigned_to IS NULL;
UPDATE formulas SET assigned_to = '{}' WHERE assigned_to IS NULL;
UPDATE suppliers SET assigned_to = '{}' WHERE assigned_to IS NULL;

-- ==========================================
-- STEP 5: Add indexes for better performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_raw_materials_assigned_to ON raw_materials USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_formulas_assigned_to ON formulas USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suppliers_assigned_to ON suppliers USING GIN(assigned_to);

-- ==========================================
-- STEP 6: Recreate validation triggers
-- ==========================================

-- Create validation function for assigned users
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

-- Create triggers for validation
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
-- STEP 7: Recreate basic policies for data access
-- ==========================================

-- Basic policies for raw materials
CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own raw materials" ON raw_materials
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to) OR
    created_by IS NULL
  );

CREATE POLICY "Users can delete their own raw materials" ON raw_materials
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL
  );

-- Basic policies for formulas
CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own formulas" ON formulas
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = ANY(assigned_to) OR
    created_by IS NULL
  );

CREATE POLICY "Users can delete their own formulas" ON formulas
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL
  );

-- Basic policies for suppliers (if RLS is enabled)
DO $$ 
BEGIN
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
        created_by IS NULL
      )';
      
    EXECUTE 'CREATE POLICY "Users can delete their own suppliers" ON suppliers
      FOR DELETE USING (
        auth.uid() = created_by OR
        created_by IS NULL
      )';
  END IF;
END $$;

-- ==========================================
-- STEP 8: Verify the conversion
-- ==========================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('raw_materials', 'formulas', 'suppliers') 
AND column_name = 'assigned_to'
ORDER BY table_name;

-- Show sample data
SELECT 
  'raw_materials' as table_name,
  id,
  COALESCE(material_name, 'Unknown') as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM raw_materials 
WHERE assigned_to IS NOT NULL
LIMIT 3;

SELECT 
  'formulas' as table_name,
  id,
  COALESCE(name, 'Unknown') as item_name,
  assigned_to,
  array_length(assigned_to, 1) as assignment_count
FROM formulas 
WHERE assigned_to IS NOT NULL
LIMIT 3;

-- Final message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 SUCCESS: Basic assigned_to array conversion completed!';
  RAISE NOTICE 'The "Assigned to me" tab should now work correctly.';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Test the filtering in your React app';
  RAISE NOTICE '2. Use the debug button to verify the conversion';
  RAISE NOTICE '3. If you need advanced RLS policies, run the complete script';
END $$; 