-- ==============================================
-- COMPLETE SUPABASE SETUP WITH DEMO DATA
-- Run this in your Supabase SQL Editor
-- ==============================================

-- First, let's ensure the table schemas are correct
-- Check if tables exist and update their structure if needed

-- Update raw_materials table structure
DO $$
BEGIN
    -- Check if weight_volume column exists and its type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'raw_materials' AND column_name = 'weight_volume'
    ) THEN
        -- Alter the column to TEXT if it's not already
        ALTER TABLE raw_materials ALTER COLUMN weight_volume TYPE TEXT;
        RAISE NOTICE 'Updated weight_volume column to TEXT type';
    END IF;
    
    -- Ensure density is also TEXT for consistency
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'raw_materials' AND column_name = 'density'
    ) THEN
        ALTER TABLE raw_materials ALTER COLUMN density TYPE TEXT;
        RAISE NOTICE 'Updated density column to TEXT type';
    END IF;
END $$;

-- Add user tracking columns to existing tables
ALTER TABLE raw_materials 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE formulas 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE suppliers 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'Employee' CHECK (role IN ('Employee', 'NSight Admin', 'Capacity Admin')),
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for raw_materials
DROP POLICY IF EXISTS "Users can view all raw materials" ON raw_materials;
CREATE POLICY "Users can view all raw materials" ON raw_materials
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert raw materials" ON raw_materials;
CREATE POLICY "Users can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own raw materials" ON raw_materials;
CREATE POLICY "Users can update their own raw materials" ON raw_materials
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own raw materials" ON raw_materials;
CREATE POLICY "Users can delete their own raw materials" ON raw_materials
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

-- Create policies for formulas
DROP POLICY IF EXISTS "Users can view all formulas" ON formulas;
CREATE POLICY "Users can view all formulas" ON formulas
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert formulas" ON formulas;
CREATE POLICY "Users can insert formulas" ON formulas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own formulas" ON formulas;
CREATE POLICY "Users can update their own formulas" ON formulas
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own formulas" ON formulas;
CREATE POLICY "Users can delete their own formulas" ON formulas
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

-- Create policies for suppliers
DROP POLICY IF EXISTS "Users can view all suppliers" ON suppliers;
CREATE POLICY "Users can view all suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
CREATE POLICY "Users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
CREATE POLICY "Users can update their own suppliers" ON suppliers
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assigned_to OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;
CREATE POLICY "Users can delete their own suppliers" ON suppliers
  FOR DELETE USING (
    auth.uid() = created_by OR
    created_by IS NULL OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('Capacity Admin', 'NSight Admin')
    )
  );

-- Create policies for user_profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'Capacity Admin'
    )
  );

-- Function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to all tables
DROP TRIGGER IF EXISTS handle_updated_at ON raw_materials;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON raw_materials
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON formulas;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON formulas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON suppliers;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at ON user_profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================
-- POPULATE MOCK DATA (WITHOUT USER ASSIGNMENTS)
-- ==============================================

-- Clear existing data first
DELETE FROM raw_materials;
DELETE FROM formulas;
DELETE FROM suppliers;

-- Reset sequences if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'raw_materials_id_seq') THEN
        ALTER SEQUENCE raw_materials_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'formulas_id_seq') THEN
        ALTER SEQUENCE formulas_id_seq RESTART WITH 1;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'suppliers_id_seq') THEN
        ALTER SEQUENCE suppliers_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Insert Suppliers (without user assignments initially)
INSERT INTO suppliers (supplier_name, supplier_id, supplier_email, supplier_contact, packaging_code, standard_cost) VALUES
('ChemCorp Industries', 'SUPP001', 'contact@chemcorp.com', '+1-555-0101', 'PKG-A1', 125.00),
('Global Chemical Solutions', 'SUPP002', 'sales@globalchem.com', '+1-555-0102', 'PKG-B2', 89.50),
('Premium Materials Co.', 'SUPP003', 'orders@premiummaterials.com', '+1-555-0103', 'PKG-C3', 156.75),
('Industrial Chemical Supply', 'SUPP004', 'procurement@indchem.com', '+1-555-0104', 'PKG-D4', 98.25),
('Advanced Chemistry Ltd.', 'SUPP005', 'info@advancedchem.com', '+1-555-0105', 'PKG-E5', 134.80),
('Precision Chemicals Inc.', 'SUPP006', 'support@precisionchem.com', '+1-555-0106', 'PKG-F6', 112.40),
('Elite Materials Group', 'SUPP007', 'sales@elitematerials.com', '+1-555-0107', 'PKG-G7', 167.20),
('Superior Chemical Works', 'SUPP008', 'orders@superiorchem.com', '+1-555-0108', 'PKG-H8', 145.60);

-- Insert Raw Materials (with corrected data types)
INSERT INTO raw_materials (material_name, supplier_name, manufacture, trade_name, supplier_cost, cas_number, weight_volume, density, country, description, physical_form, purity, storage_conditions, hazard_class, shelf_life) VALUES
('Acetone', 'ChemCorp Industries', 'ChemCorp', 'AcetoPure', 25.50, '67-64-1', '1L', '0.784 g/mL', 'USA', 'High-purity acetone for laboratory use', 'Liquid', '99.9%', 'Store in cool, dry place', 'Flammable', '3 years'),
('Ethanol', 'Global Chemical Solutions', 'GlobalChem', 'EthylMax', 18.75, '64-17-5', '5L', '0.789 g/mL', 'Canada', 'Denatured ethanol for industrial applications', 'Liquid', '95%', 'Store away from heat sources', 'Flammable', '2 years'),
('Sodium Chloride', 'Premium Materials Co.', 'PremiumChem', 'SaltPro', 12.30, '7647-14-5', '25kg', '2.17 g/cm³', 'Mexico', 'Reagent grade sodium chloride', 'Crystalline Solid', '99.5%', 'Store in dry conditions', 'Non-hazardous', '5 years'),
('Hydrochloric Acid', 'Industrial Chemical Supply', 'IndChem', 'HCl-Pro', 45.80, '7647-01-0', '2.5L', '1.18 g/mL', 'Germany', 'Concentrated hydrochloric acid 37%', 'Liquid', '37%', 'Store in corrosion-resistant containers', 'Corrosive', '2 years'),
('Methanol', 'Advanced Chemistry Ltd.', 'AdvChem', 'MethanolPlus', 22.15, '67-56-1', '4L', '0.792 g/mL', 'Netherlands', 'HPLC grade methanol', 'Liquid', '99.9%', 'Store in cool, ventilated area', 'Toxic', '3 years'),
('Sulfuric Acid', 'Precision Chemicals Inc.', 'PrecisionChem', 'H2SO4-Ultra', 38.95, '7664-93-9', '1L', '1.84 g/mL', 'Belgium', 'Concentrated sulfuric acid 98%', 'Liquid', '98%', 'Store in acid-resistant containers', 'Corrosive', '3 years'),
('Benzene', 'Elite Materials Group', 'EliteChem', 'BenzoPure', 67.40, '71-43-2', '1L', '0.876 g/mL', 'France', 'Anhydrous benzene for synthesis', 'Liquid', '99.8%', 'Store under inert atmosphere', 'Carcinogenic', '2 years'),
('Toluene', 'Superior Chemical Works', 'SuperiorChem', 'ToluMax', 31.85, '108-88-3', '2L', '0.867 g/mL', 'Italy', 'Technical grade toluene', 'Liquid', '99.5%', 'Store away from oxidizing agents', 'Flammable', '3 years'),
('Potassium Hydroxide', 'ChemCorp Industries', 'ChemCorp', 'KOH-Grade', 28.60, '1310-58-3', '500g', '2.04 g/cm³', 'USA', 'Reagent grade potassium hydroxide pellets', 'Solid', '85%', 'Store in tightly sealed containers', 'Corrosive', '4 years'),
('Chloroform', 'Global Chemical Solutions', 'GlobalChem', 'ChloroMax', 52.30, '67-66-3', '1L', '1.483 g/mL', 'Canada', 'Stabilized chloroform with amylene', 'Liquid', '99%', 'Store in dark, cool place', 'Carcinogenic', '1 year');

-- Insert Formulas (without user assignments initially)
INSERT INTO formulas (id, name, total_cost, final_sale_price_drum, final_sale_price_tote, ingredients) VALUES
('FORM001', 'Industrial Degreaser Formula', 156.75, 285.50, 520.00, '[{"name": "Acetone", "percentage": 35, "cost": 25.50}, {"name": "Ethanol", "percentage": 25, "cost": 18.75}, {"name": "Toluene", "percentage": 20, "cost": 31.85}, {"name": "Surfactant Blend", "percentage": 20, "cost": 80.65}]'),
('FORM002', 'Precision Cleaning Solution', 89.40, 165.80, 298.00, '[{"name": "Methanol", "percentage": 40, "cost": 22.15}, {"name": "Ethanol", "percentage": 30, "cost": 18.75}, {"name": "Purified Water", "percentage": 25, "cost": 2.50}, {"name": "Stabilizer", "percentage": 5, "cost": 46.00}]'),
('FORM003', 'Heavy Duty Solvent Mix', 234.20, 425.75, 785.00, '[{"name": "Benzene", "percentage": 30, "cost": 67.40}, {"name": "Toluene", "percentage": 25, "cost": 31.85}, {"name": "Chloroform", "percentage": 20, "cost": 52.30}, {"name": "Acetone", "percentage": 15, "cost": 25.50}, {"name": "Antioxidant", "percentage": 10, "cost": 57.15}]'),
('FORM004', 'Acid Neutralization Buffer', 67.85, 125.60, 235.00, '[{"name": "Sodium Chloride", "percentage": 45, "cost": 12.30}, {"name": "Potassium Hydroxide", "percentage": 25, "cost": 28.60}, {"name": "Buffer Salts", "percentage": 20, "cost": 18.75}, {"name": "pH Indicator", "percentage": 10, "cost": 8.20}]'),
('FORM005', 'Laboratory Grade Reagent', 145.90, 268.50, 489.00, '[{"name": "Hydrochloric Acid", "percentage": 35, "cost": 45.80}, {"name": "Sulfuric Acid", "percentage": 25, "cost": 38.95}, {"name": "Purified Water", "percentage": 30, "cost": 2.50}, {"name": "Catalyst Blend", "percentage": 10, "cost": 58.65}]'),
('FORM006', 'Multi-Purpose Cleaner Base', 78.25, 145.90, 268.00, '[{"name": "Ethanol", "percentage": 50, "cost": 18.75}, {"name": "Sodium Chloride", "percentage": 20, "cost": 12.30}, {"name": "Surfactant", "percentage": 15, "cost": 24.20}, {"name": "Fragrance", "percentage": 15, "cost": 23.00}]'),
('FORM007', 'Specialized Extraction Medium', 198.75, 365.25, 678.00, '[{"name": "Methanol", "percentage": 40, "cost": 22.15}, {"name": "Chloroform", "percentage": 30, "cost": 52.30}, {"name": "Buffer Solution", "percentage": 20, "cost": 35.80}, {"name": "Extraction Enhancer", "percentage": 10, "cost": 88.50}]'),
('FORM008', 'High-Performance Solvent', 312.60, 578.90, 1085.00, '[{"name": "Benzene", "percentage": 35, "cost": 67.40}, {"name": "Toluene", "percentage": 30, "cost": 31.85}, {"name": "Specialized Additive", "percentage": 20, "cost": 125.75}, {"name": "Stabilizer Complex", "percentage": 15, "cost": 87.60}]');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create demo users through your app or Supabase dashboard:';
    RAISE NOTICE '   - admin@chemformation.com / password123';
    RAISE NOTICE '   - manager@chemformation.com / password123';  
    RAISE NOTICE '   - employee@chemformation.com / password123';
    RAISE NOTICE '';
    RAISE NOTICE '2. Update user roles by running:';
    RAISE NOTICE '   UPDATE user_profiles SET role = ''admin'' WHERE email = ''admin@chemformation.com'';';
    RAISE NOTICE '   UPDATE user_profiles SET role = ''manager'' WHERE email = ''manager@chemformation.com'';';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Mock data created:';
    RAISE NOTICE '   - 10 raw materials';
    RAISE NOTICE '   - 8 formulas';
    RAISE NOTICE '   - 8 suppliers';
    RAISE NOTICE '';
    RAISE NOTICE 'All data is initially unassigned and can be edited by any user.';
    RAISE NOTICE 'Admins and managers can edit all data.';
END $$; 