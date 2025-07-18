-- Update assigned_to fields to support multiple assignments (arrays)
-- This allows formulas and raw materials to be assigned to multiple employees

-- 1. Update raw_materials table
ALTER TABLE raw_materials 
ALTER COLUMN assigned_to TYPE UUID[] USING ARRAY[assigned_to]::UUID[];

-- 2. Update formulas table
ALTER TABLE formulas 
ALTER COLUMN assigned_to TYPE UUID[] USING ARRAY[assigned_to]::UUID[];

-- 3. Update suppliers table (if needed)
ALTER TABLE suppliers 
ALTER COLUMN assigned_to TYPE UUID[] USING ARRAY[assigned_to]::UUID[];

-- 4. Create indexes for better performance on array operations
CREATE INDEX IF NOT EXISTS idx_raw_materials_assigned_to ON raw_materials USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_formulas_assigned_to ON formulas USING GIN(assigned_to);
CREATE INDEX IF NOT EXISTS idx_suppliers_assigned_to ON suppliers USING GIN(assigned_to);

-- 5. Update any existing single assignments to be empty arrays where NULL
UPDATE raw_materials SET assigned_to = '{}' WHERE assigned_to IS NULL;
UPDATE formulas SET assigned_to = '{}' WHERE assigned_to IS NULL;
UPDATE suppliers SET assigned_to = '{}' WHERE assigned_to IS NULL;

-- 6. Add comments for documentation
COMMENT ON COLUMN raw_materials.assigned_to IS 'Array of user IDs this material is assigned to';
COMMENT ON COLUMN formulas.assigned_to IS 'Array of user IDs this formula is assigned to';
COMMENT ON COLUMN suppliers.assigned_to IS 'Array of user IDs this supplier is assigned to';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Successfully updated assigned_to fields to support multiple assignments!';
    RAISE NOTICE 'Formulas, raw materials, and suppliers can now be assigned to multiple employees.';
END $$; 