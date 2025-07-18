-- Add missing columns to raw_materials table
-- Run this in your Supabase SQL Editor

ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS activity_percentage TEXT,
ADD COLUMN IF NOT EXISTS viscosity TEXT,
ADD COLUMN IF NOT EXISTS cost NUMERIC(10,2);

-- Add comments to document the new columns
COMMENT ON COLUMN raw_materials.activity_percentage IS 'Percentage activity/concentration of the material';
COMMENT ON COLUMN raw_materials.viscosity IS 'Viscosity measurement of the material';
COMMENT ON COLUMN raw_materials.cost IS 'Cost of the material in USD'; 