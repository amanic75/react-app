-- Level 2 Enhancement: Add verified chemical database fields
-- These fields store verified data from PubChem and other chemical databases

-- Add Level 2 chemical verification fields
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS molecular_formula TEXT,
ADD COLUMN IF NOT EXISTS molecular_weight NUMERIC,
ADD COLUMN IF NOT EXISTS iupac_name TEXT,
ADD COLUMN IF NOT EXISTS pubchem_cid TEXT,
ADD COLUMN IF NOT EXISTS canonical_smiles TEXT;

-- Add comments for the new fields
COMMENT ON COLUMN raw_materials.molecular_formula IS 'Verified molecular formula from chemical databases (e.g., C8H10N4O2)';
COMMENT ON COLUMN raw_materials.molecular_weight IS 'Verified molecular weight in g/mol from chemical databases';
COMMENT ON COLUMN raw_materials.iupac_name IS 'Official IUPAC chemical name from databases';
COMMENT ON COLUMN raw_materials.pubchem_cid IS 'PubChem Compound ID for cross-reference';
COMMENT ON COLUMN raw_materials.canonical_smiles IS 'Canonical SMILES notation for chemical structure';

-- Add indexes for common lookups
CREATE INDEX IF NOT EXISTS idx_raw_materials_pubchem_cid ON raw_materials(pubchem_cid);
CREATE INDEX IF NOT EXISTS idx_raw_materials_molecular_formula ON raw_materials(molecular_formula); 