-- Step 2: Add Database Schema for Verification Data (FIXED)
-- Enhanced Accuracy Implementation - Phase 1

-- Add verification tracking columns to raw_materials table
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS data_source_notes TEXT,
ADD COLUMN IF NOT EXISTS verification_sources TEXT[],
ADD COLUMN IF NOT EXISTS confidence_level TEXT,
ADD COLUMN IF NOT EXISTS last_verified TIMESTAMPTZ;

-- Create verification log table for tracking verification history
CREATE TABLE IF NOT EXISTS material_verification_log (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES raw_materials(id),
  verification_type TEXT,
  data_source TEXT,
  verification_result JSONB,
  confidence_score INTEGER,
  verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_material_verification_material_id 
ON material_verification_log(material_id);

CREATE INDEX IF NOT EXISTS idx_material_verification_verified_at 
ON material_verification_log(verified_at);

-- Add constraint for confidence_level values (safe way)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_confidence_level' 
        AND table_name = 'raw_materials'
    ) THEN
        ALTER TABLE raw_materials 
        ADD CONSTRAINT check_confidence_level 
        CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'MIXED') OR confidence_level IS NULL);
    END IF;
END $$;

-- Update existing materials with default verification timestamp
UPDATE raw_materials 
SET last_verified = NOW() 
WHERE last_verified IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN raw_materials.data_source_notes IS 'Human-readable notes about data reliability and sources';
COMMENT ON COLUMN raw_materials.verification_sources IS 'Array of data source identifiers (e.g., PubChem, supplier APIs)';
COMMENT ON COLUMN raw_materials.confidence_level IS 'Overall confidence level: HIGH, MEDIUM, LOW, or MIXED';
COMMENT ON COLUMN raw_materials.last_verified IS 'Timestamp when data was last verified or added';

COMMENT ON TABLE material_verification_log IS 'Log of all verification attempts and results for materials'; 