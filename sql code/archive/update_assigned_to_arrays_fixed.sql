-- Update assigned_to fields to support multiple assignments (arrays)
-- Fixed version that properly handles trigger dependencies

-- STEP 1: Drop existing triggers that depend on assigned_to columns
DROP TRIGGER IF EXISTS validate_raw_materials_assigned_users ON raw_materials;
DROP TRIGGER IF EXISTS validate_formulas_assigned_users ON formulas;
DROP TRIGGER IF EXISTS validate_suppliers_assigned_users ON suppliers;

-- STEP 2: Drop foreign key constraints on assigned_to columns
ALTER TABLE raw_materials DROP CONSTRAINT IF EXISTS raw_materials_assigned_to_fkey;
ALTER TABLE formulas DROP CONSTRAINT IF EXISTS formulas_assigned_to_fkey;
ALTER TABLE suppliers DROP CONSTRAINT IF EXISTS suppliers_assigned_to_fkey;

-- STEP 3: Drop existing policies that reference assigned_to
DROP POLICY IF EXISTS "Users can update their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete their own raw materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;
DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;

-- STEP 4: Alter column types from UUID to UUID[]
ALTER TABLE raw_materials 
ALTER COLUMN assigned_to TYPE UUID[] USING 
  CASE 
    WHEN assigned_to IS NULL THEN '{}'::UUID[]
    ELSE ARRAY[assigned_to]::UUID[]
  END;

ALTER TABLE formulas 
ALTER COLUMN assigned_to TYPE UUID[] USING 
  CASE 
    WHEN assigned_to IS NULL THEN '{}'::UUID[]
    ELSE ARRAY[assigned_to]::UUID[]
  END;

ALTER TABLE suppliers 
ALTER COLUMN assigned_to TYPE UUID[] USING 
  CASE 
    WHEN assigned_to IS NULL THEN '{}'::UUID[]
    ELSE ARRAY[assigned_to]::UUID[]
  END;

-- STEP 5: Create indexes for better performance on array operations
CREATE INDEX IF NOT EXISTS idx_raw_materials_assigned_to ON raw_materials USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_formulas_assigned_to ON formulas USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suppliers_assigned_to ON suppliers USING GIN(assigned_to);

-- STEP 6: Create a function to validate user IDs exist (since we can't use array foreign keys)
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
      RAISE EXCEPTION 'One or more assigned user IDs do not exist';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Create triggers to validate assigned users
CREATE TRIGGER validate_raw_materials_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON raw_materials
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

CREATE TRIGGER validate_formulas_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON formulas
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

CREATE TRIGGER validate_suppliers_assigned_users
  BEFORE INSERT OR UPDATE OF assigned_to ON suppliers
  FOR EACH ROW EXECUTE FUNCTION validate_assigned_users();

-- STEP 8: Recreate policies with array support
-- Raw Materials policies
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

-- Suppliers policies (if they exist)
DO $$ 
BEGIN
  -- Only create if the table has RLS enabled
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'suppliers' 
    AND rowsecurity = true
  ) THEN
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
END $$;

-- STEP 9: Add comments for documentation
COMMENT ON COLUMN raw_materials.assigned_to IS 'Array of user IDs this material is assigned to';
COMMENT ON COLUMN formulas.assigned_to IS 'Array of user IDs this formula is assigned to';
COMMENT ON COLUMN suppliers.assigned_to IS 'Array of user IDs this supplier is assigned to';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully updated assigned_to fields to support multiple assignments!';
    RAISE NOTICE 'Foreign key constraints have been replaced with validation triggers.';
    RAISE NOTICE 'RLS policies have been updated to work with array assignments.';
END $$; 