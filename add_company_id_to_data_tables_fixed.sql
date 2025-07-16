-- Add company_id to data tables for multi-tenant isolation (FIXED)
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

-- 4. Set company_id for existing data (assuming all current data belongs to the first company)
-- First, find the first company ID
DO $$
DECLARE
  first_company_id UUID;
BEGIN
  -- Get the first company ID
  SELECT id INTO first_company_id 
  FROM companies 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  -- Update existing formulas
  IF first_company_id IS NOT NULL THEN
    UPDATE formulas 
    SET company_id = first_company_id 
    WHERE company_id IS NULL;
    
    UPDATE raw_materials 
    SET company_id = first_company_id 
    WHERE company_id IS NULL;
    
    UPDATE suppliers 
    SET company_id = first_company_id 
    WHERE company_id IS NULL;
    
    RAISE NOTICE 'Updated existing data to belong to company ID: %', first_company_id;
  ELSE
    RAISE NOTICE 'No companies found in the database';
  END IF;
END $$;

-- 5. Show the results
SELECT 
  'formulas' as table_name,
  COUNT(*) as total_records,
  COUNT(company_id) as records_with_company_id
FROM formulas
UNION ALL
SELECT 
  'raw_materials' as table_name,
  COUNT(*) as total_records,
  COUNT(company_id) as records_with_company_id
FROM raw_materials
UNION ALL
SELECT 
  'suppliers' as table_name,
  COUNT(*) as total_records,
  COUNT(company_id) as records_with_company_id
FROM suppliers;

-- 6. Show sample data with company information (using correct column names)
SELECT 
  'formulas' as table_name,
  f.name as formula_name,
  c.company_name,
  f.company_id
FROM formulas f
LEFT JOIN companies c ON f.company_id = c.id
LIMIT 5; 