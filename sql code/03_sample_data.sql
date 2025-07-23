-- ==============================================
-- 03_SAMPLE_DATA.SQL
-- Sample data for development and testing
-- Consolidates: create_sample_companies.sql, create_sample_companies_safe.sql
-- ==============================================

-- ==============================================
-- SAMPLE COMPANIES DATA
-- ==============================================

-- Insert sample companies (safe - will not overwrite existing)
INSERT INTO companies (
  id,
  company_name,
  industry,
  company_size,
  website,
  country,
  timezone,
  contact_name,
  contact_email,
  contact_phone,
  contact_title,
  database_isolation,
  data_retention,
  backup_frequency,
  api_rate_limit,
  data_residency,
  compliance_standards,
  sso_enabled,
  two_factor_required,
  subscription_tier,
  billing_contact,
  billing_email,
  payment_method,
  admin_user_name,
  admin_user_email,
  default_departments,
  initial_apps,
  status,
  setup_complete
) VALUES 
-- Capacity Chemicals (Main Company)
(
  'f42538be-9dcb-493a-9e2e-8b10691ace25',
  'Capacity Chemicals',
  'Chemical Manufacturing',
  '201-500',
  'https://www.capacitychemicals.com',
  'United States',
  'America/New_York',
  'John Smith',
  'john.smith@capacitychemicals.com',
  '+1-555-0123',
  'CTO',
  'schema',
  '7-years',
  'daily',
  1000,
  'us-east',
  ARRAY['ISO9001', 'ISO14001', 'OSHA', 'FDA', 'REACH', 'GMP'],
  false,
  true,
  'enterprise',
  'Sarah Johnson',
  'billing@capacitychemicals.com',
  'credit-card',
  'Admin Test',
  'admintest@capacity.com',
  ARRAY['Production', 'Quality Control', 'Research', 'Sales'],
  ARRAY['formulas', 'suppliers'],
  'Active',
  true
),
-- NSight Demo Company
(
  'ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80',
  'NSight Chemicals',
  'Chemical Research',
  '51-200',
  'https://www.nsight-chemicals.com',
  'United States',
  'America/New_York',
  'Dr. Sarah Wilson',
  'sarah.wilson@nsight-chemicals.com',
  '+1-555-0456',
  'Research Director',
  'schema',
  '10-years',
  'daily',
  2000,
  'us-east',
  ARRAY['ISO9001', 'ISO14001', 'GMP', 'FDA'],
  true,
  true,
  'enterprise',
  'Michael Chen',
  'billing@nsight-chemicals.com',
  'invoice',
  'Dr. Sarah Wilson',
  'sarah.wilson@nsight-chemicals.com',
  ARRAY['Research', 'Development', 'Quality Assurance'],
  ARRAY['formulas', 'raw-materials', 'quality-control'],
  'Active',
  true
),
-- Test Client Company
(
  'c7cc44f2-1955-4442-8379-0af2caf52bfd',
  'TestChem Industries',
  'Specialty Chemicals',
  '1-50',
  'https://www.testchem.com',
  'Canada',
  'America/Toronto',
  'David Thompson',
  'david.thompson@testchem.com',
  '+1-416-555-0789',
  'CEO',
  'schema',
  '5-years',
  'weekly',
  500,
  'ca-central',
  ARRAY['ISO9001', 'REACH'],
  false,
  false,
  'professional',
  'David Thompson',
  'david.thompson@testchem.com',
  'invoice',
  'David Thompson',
  'david.thompson@testchem.com',
  ARRAY['Production', 'Quality Control'],
  ARRAY['formulas', 'raw-materials', 'suppliers'],
  'Active',
  true
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- SAMPLE COMPANY APPS DATA
-- ==============================================

-- Insert sample company apps configurations
INSERT INTO company_apps (company_id, app_id, app_name, enabled, configuration) VALUES
-- Capacity Chemicals Apps
('f42538be-9dcb-493a-9e2e-8b10691ace25', 'formulas', 'Formulas Management', true, '{"view_mode": "grid", "default_sort": "name"}'),
('f42538be-9dcb-493a-9e2e-8b10691ace25', 'suppliers', 'Suppliers', true, '{"view_mode": "table", "default_sort": "company_name"}'),

-- NSight Chemicals Apps  
('ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 'formulas', 'Formulas Management', true, '{"view_mode": "grid", "enable_advanced_search": true}'),
('ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 'raw-materials', 'Raw Materials', true, '{"view_mode": "table", "show_cas_numbers": true}'),
('ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 'quality-control', 'Quality Control', true, '{"enable_batch_testing": true}'),

-- TestChem Industries Apps
('c7cc44f2-1955-4442-8379-0af2caf52bfd', 'formulas', 'Formulas Management', true, '{"view_mode": "list"}'),
('c7cc44f2-1955-4442-8379-0af2caf52bfd', 'raw-materials', 'Raw Materials', true, '{"view_mode": "grid"}'),
('c7cc44f2-1955-4442-8379-0af2caf52bfd', 'suppliers', 'Suppliers', true, '{"view_mode": "table"}')
ON CONFLICT (company_id, app_id) DO NOTHING;

-- ==============================================
-- SAMPLE USER PROFILES
-- ==============================================

-- Note: User profiles are typically created when users first log in
-- This section shows the structure but doesn't insert actual users
-- as they require corresponding auth.users entries

-- Sample user profile structure (for reference):
/*
INSERT INTO user_profiles (id, email, first_name, last_name, role, department, app_access) VALUES
-- Capacity Chemicals users would be inserted here when they sign up
-- NSight admin users would be inserted here when they sign up
-- TestChem users would be inserted here when they sign up
*/

-- ==============================================
-- SAMPLE LEGACY DATA (for testing backward compatibility)
-- ==============================================

-- Sample raw materials
INSERT INTO raw_materials (material_name, supplier_name, cas_number, quantity, unit, cost, weight_volume, density) VALUES
('Sodium Chloride', 'ChemSupply Co', '7647-14-5', '100', 'kg', 25.50, '100 kg', '2.16 g/cm³'),
('Sulfuric Acid', 'Industrial Chemicals Ltd', '7664-93-9', '500', 'L', 150.00, '500 L', '1.84 g/cm³'),
('Calcium Carbonate', 'Mineral Solutions Inc', '471-34-1', '1000', 'kg', 80.00, '1000 kg', '2.71 g/cm³'),
('Ethanol', 'Solvent Specialists', '64-17-5', '200', 'L', 120.00, '200 L', '0.789 g/cm³'),
('Citric Acid', 'Food Grade Chemicals', '77-92-9', '50', 'kg', 75.00, '50 kg', '1.665 g/cm³')
ON CONFLICT DO NOTHING;

-- Sample formulas
INSERT INTO formulas (formula_name, chemical_composition, density, ph_level) VALUES
('Basic Cleaning Solution', 'H2O (90%), NaCl (8%), C6H8O7 (2%)', 1.05, 7.2),
('Industrial Degreaser', 'C2H5OH (70%), H2O (25%), Surfactants (5%)', 0.85, 8.1),
('pH Buffer Solution', 'H3PO4 (15%), Na2HPO4 (25%), H2O (60%)', 1.12, 7.0),
('Calcium Supplement', 'CaCO3 (95%), Stabilizers (5%)', 2.5, 9.2),
('Acid Neutralizer', 'NaHCO3 (80%), CaCO3 (15%), Additives (5%)', 2.2, 8.5)
ON CONFLICT DO NOTHING;

-- Sample suppliers
INSERT INTO suppliers (company_name, contact_person, email, phone, address) VALUES
('ChemSupply Co', 'Robert Johnson', 'robert@chemsupply.com', '+1-555-0101', '123 Chemical Ave, Houston, TX 77001'),
('Industrial Chemicals Ltd', 'Maria Rodriguez', 'maria@indchem.com', '+1-555-0202', '456 Factory St, Newark, NJ 07102'),
('Mineral Solutions Inc', 'James Wilson', 'james@mineralsol.com', '+1-555-0303', '789 Mining Rd, Denver, CO 80201'),
('Solvent Specialists', 'Lisa Chen', 'lisa@solventspec.com', '+1-555-0404', '321 Solvent Blvd, Los Angeles, CA 90001'),
('Food Grade Chemicals', 'David Brown', 'david@foodchem.com', '+1-555-0505', '654 Safety St, Atlanta, GA 30301')
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE APP DATA (using new generic structure)
-- ==============================================

-- Sample formula data in the new app_data structure
INSERT INTO app_data (app_id, company_id, data_type, data) VALUES
('formulas', 'f42538be-9dcb-493a-9e2e-8b10691ace25', 'formula', 
 '{"name": "Multi-Purpose Cleaner", "composition": "Water 85%, Surfactants 10%, Preservatives 5%", "ph": 7.5, "density": 1.02}'::jsonb),
('formulas', 'f42538be-9dcb-493a-9e2e-8b10691ace25', 'formula',
 '{"name": "Glass Cleaner", "composition": "Water 70%, Isopropanol 25%, Ammonia 5%", "ph": 8.2, "density": 0.95}'::jsonb),

('raw-materials', 'ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 'raw_material',
 '{"name": "Titanium Dioxide", "cas": "13463-67-7", "supplier": "Advanced Materials Corp", "quantity": "250 kg", "purity": "99.5%"}'::jsonb),
('raw-materials', 'ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 'raw_material',
 '{"name": "Benzyl Alcohol", "cas": "100-51-6", "supplier": "Specialty Solvents Ltd", "quantity": "100 L", "purity": "99.8%"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE ACTIVITY DATA
-- ==============================================

-- Sample user activity (for demonstration)
INSERT INTO user_activity (user_email, activity_type, table_name, description) VALUES
('admintest@capacity.com', 'CREATE', 'formulas', 'Created new formula: Multi-Purpose Cleaner'),
('admintest@capacity.com', 'UPDATE', 'raw_materials', 'Updated quantity for Sodium Chloride'),
('sarah.wilson@nsight-chemicals.com', 'CREATE', 'raw_materials', 'Added new material: Titanium Dioxide'),
('david.thompson@testchem.com', 'VIEW', 'suppliers', 'Viewed suppliers list')
ON CONFLICT DO NOTHING;

-- ==============================================
-- VALIDATION QUERIES
-- ==============================================

-- Verify sample data was inserted correctly
SELECT 'Sample data insertion completed!' as status;

-- Show summary of inserted data
SELECT 
  'Companies' as entity,
  COUNT(*) as count
FROM companies
WHERE id IN (
  'f42538be-9dcb-493a-9e2e-8b10691ace25',
  'ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80', 
  'c7cc44f2-1955-4442-8379-0af2caf52bfd'
)

UNION ALL

SELECT 
  'Company Apps' as entity,
  COUNT(*) as count
FROM company_apps

UNION ALL

SELECT 
  'Raw Materials' as entity,
  COUNT(*) as count  
FROM raw_materials

UNION ALL

SELECT 
  'Formulas' as entity,
  COUNT(*) as count
FROM formulas

UNION ALL

SELECT 
  'Suppliers' as entity,
  COUNT(*) as count
FROM suppliers

UNION ALL

SELECT 
  'App Data Records' as entity,
  COUNT(*) as count
FROM app_data;

-- Show companies with their apps
SELECT 
  c.company_name,
  c.industry,
  c.subscription_tier,
  ARRAY_AGG(ca.app_name ORDER BY ca.app_name) as enabled_apps
FROM companies c
LEFT JOIN company_apps ca ON c.id = ca.company_id AND ca.enabled = true
WHERE c.id IN (
  'f42538be-9dcb-493a-9e2e-8b10691ace25',
  'ce52c20f-d3d1-4a37-8ec6-b6a8049d3c80',
  'c7cc44f2-1955-4442-8379-0af2caf52bfd'
)
GROUP BY c.id, c.company_name, c.industry, c.subscription_tier
ORDER BY c.company_name; 