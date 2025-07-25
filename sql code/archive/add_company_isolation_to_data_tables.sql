-- Add company_id to data tables for multi-tenant isolation
-- This ensures each company only sees their own data

-- 1. Add company_id to formulas table
ALTER TABLE formulas 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_formulas_company_id ON formulas(company_id);

-- 2. Add company_id to raw_materials table
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_company_id ON raw_materials(company_id);

-- 3. Add company_id to suppliers table
ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);

-- 4. Set company_id for existing data (assuming all current data belongs to Capacity Chemicals)
-- First, find the Capacity Chemicals company ID
DO $$
DECLARE
  capacity_company_id UUID;
BEGIN
  -- Get Capacity Chemicals company ID
  SELECT id INTO capacity_company_id 
  FROM companies 
  WHERE LOWER(company_name) LIKE '%capacity chemicals%'
  LIMIT 1;

  IF capacity_company_id IS NOT NULL THEN
    -- Update formulas
    UPDATE formulas 
    SET company_id = capacity_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Updated % formulas with Capacity Chemicals company_id', ROW_COUNT;

    -- Update raw_materials
    UPDATE raw_materials 
    SET company_id = capacity_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Updated % raw materials with Capacity Chemicals company_id', ROW_COUNT;

    -- Update suppliers
    UPDATE suppliers 
    SET company_id = capacity_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Updated % suppliers with Capacity Chemicals company_id', ROW_COUNT;
  ELSE
    RAISE WARNING 'Capacity Chemicals company not found. Please update company_id manually.';
  END IF;
END $$;

-- 5. Add RLS policies for company-based access control

-- Enable RLS on tables
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS formulas_company_isolation ON formulas;
DROP POLICY IF EXISTS raw_materials_company_isolation ON raw_materials;
DROP POLICY IF EXISTS suppliers_company_isolation ON suppliers;

-- Create policies for formulas
CREATE POLICY formulas_company_isolation ON formulas
  FOR ALL USING (
    -- NSight Admins can see all formulas
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'NSight Admin'
    )
    OR
    -- Users can only see formulas from their company
    company_id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid()
      AND status = 'Active'
    )
  );

-- Create policies for raw_materials
CREATE POLICY raw_materials_company_isolation ON raw_materials
  FOR ALL USING (
    -- NSight Admins can see all materials
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'NSight Admin'
    )
    OR
    -- Users can only see materials from their company
    company_id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid()
      AND status = 'Active'
    )
  );

-- Create policies for suppliers
CREATE POLICY suppliers_company_isolation ON suppliers
  FOR ALL USING (
    -- NSight Admins can see all suppliers
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'NSight Admin'
    )
    OR
    -- Users can only see suppliers from their company
    company_id IN (
      SELECT company_id 
      FROM company_users 
      WHERE user_id = auth.uid()
      AND status = 'Active'
    )
  );

-- 6. Verify the changes
SELECT 
  'Formulas with company_id' as check_type,
  COUNT(*) as total_count,
  COUNT(company_id) as with_company_id,
  COUNT(*) - COUNT(company_id) as missing_company_id
FROM formulas

UNION ALL

SELECT 
  'Raw Materials with company_id' as check_type,
  COUNT(*) as total_count,
  COUNT(company_id) as with_company_id,
  COUNT(*) - COUNT(company_id) as missing_company_id
FROM raw_materials

UNION ALL

SELECT 
  'Suppliers with company_id' as check_type,
  COUNT(*) as total_count,
  COUNT(company_id) as with_company_id,
  COUNT(*) - COUNT(company_id) as missing_company_id
FROM suppliers; 