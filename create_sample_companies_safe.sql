-- ==============================================
-- CREATE SAMPLE COMPANIES FOR TESTING DATA CONSISTENCY (SAFE VERSION)
-- This version handles duplicate entries gracefully
-- Run this in your Supabase SQL Editor after the companies schema is set up
-- ==============================================

-- Insert sample companies (skip if they already exist)
INSERT INTO companies (
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
(
    'Capacity Chemicals',
    'Chemical Manufacturing',
    '51-200',
    'https://capacity-chemicals.com',
    'United States',
    'America/New_York',
    'John Smith',
    'john.smith@capacity-chemicals.com',
    '+1-555-0123',
    'CEO',
    'schema',
    '7-years',
    'daily',
    1000,
    'us-east',
    '["ISO9001", "ISO14001"]'::jsonb,
    false,
    false,
    'professional',
    'Jane Doe',
    'billing@capacity-chemicals.com',
    'invoice',
    'Admin User',
    'admin@capacity-chemicals.com',
    '["Production", "Quality Control", "Research"]'::jsonb,
    '["formulas", "raw-materials", "suppliers"]'::jsonb,
    'Active',
    true
),
(
    'ChemTech Solutions',
    'Chemical Manufacturing',
    '201-500',
    'https://chemtech-solutions.com',
    'Canada',
    'America/Toronto',
    'Sarah Johnson',
    'sarah.johnson@chemtech-solutions.com',
    '+1-555-0456',
    'CTO',
    'schema',
    '5-years',
    'daily',
    1500,
    'ca-central',
    '["ISO9001"]'::jsonb,
    true,
    true,
    'enterprise',
    'Mike Wilson',
    'billing@chemtech-solutions.com',
    'credit-card',
    'Sarah Johnson',
    'sarah.admin@chemtech-solutions.com',
    '["Engineering", "Quality Assurance", "Operations"]'::jsonb,
    '["formulas", "raw-materials"]'::jsonb,
    'Active',
    true
),
(
    'Industrial Formulators Inc',
    'Chemical Manufacturing',
    '11-50',
    'https://industrial-formulators.com',
    'United States',
    'America/Chicago',
    'David Brown',
    'david.brown@industrial-formulators.com',
    '+1-555-0789',
    'Founder',
    'database',
    '3-years',
    'weekly',
    500,
    'us-central',
    '["ISO9001"]'::jsonb,
    false,
    false,
    'starter',
    'Lisa Brown',
    'billing@industrial-formulators.com',
    'invoice',
    'David Brown',
    'david.admin@industrial-formulators.com',
    '["Production", "Sales"]'::jsonb,
    '["formulas"]'::jsonb,
    'Active',
    true
)
ON CONFLICT (company_name) DO NOTHING;

-- Insert corresponding company apps for each company (skip if they already exist)
INSERT INTO company_apps (company_id, app_id, app_name, enabled, configuration, deployed_at) 
SELECT 
    c.id as company_id,
    apps.app_id,
    CASE 
        WHEN apps.app_id = 'formulas' THEN 'Formulas'
        WHEN apps.app_id = 'raw-materials' THEN 'Raw Materials'
        WHEN apps.app_id = 'suppliers' THEN 'Suppliers'
        ELSE 'Unknown'
    END as app_name,
    true as enabled,
    '{}'::jsonb as configuration,
    NOW() as deployed_at
FROM companies c
CROSS JOIN LATERAL jsonb_array_elements_text(c.initial_apps) AS apps(app_id)
WHERE c.company_name IN ('Capacity Chemicals', 'ChemTech Solutions', 'Industrial Formulators Inc')
ON CONFLICT (company_id, app_id) DO NOTHING;

-- Display success message and show what was created
DO $$
DECLARE
    company_count INT;
    app_count INT;
    capacity_exists BOOLEAN;
    chemtech_exists BOOLEAN;
    industrial_exists BOOLEAN;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO app_count FROM company_apps;
    
    -- Check which companies exist
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_name = 'Capacity Chemicals') INTO capacity_exists;
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_name = 'ChemTech Solutions') INTO chemtech_exists;
    SELECT EXISTS(SELECT 1 FROM companies WHERE company_name = 'Industrial Formulators Inc') INTO industrial_exists;
    
    RAISE NOTICE '✅ Sample companies script completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '- Total companies in database: %', company_count;
    RAISE NOTICE '- Total company apps in database: %', app_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Company status:';
    IF capacity_exists THEN
        RAISE NOTICE '✅ Capacity Chemicals - EXISTS (admin@capacity-chemicals.com)';
    ELSE
        RAISE NOTICE '❌ Capacity Chemicals - NOT FOUND';
    END IF;
    
    IF chemtech_exists THEN
        RAISE NOTICE '✅ ChemTech Solutions - EXISTS (sarah.admin@chemtech-solutions.com)';
    ELSE
        RAISE NOTICE '❌ ChemTech Solutions - NOT FOUND';
    END IF;
    
    IF industrial_exists THEN
        RAISE NOTICE '✅ Industrial Formulators Inc - EXISTS (david.admin@industrial-formulators.com)';
    ELSE
        RAISE NOTICE '❌ Industrial Formulators Inc - NOT FOUND';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Go to NSight Admin Dashboard → Existing Company Mode';
    RAISE NOTICE '2. Click "Sync Companies" to create/link admin user accounts';
    RAISE NOTICE '3. Test that admin accounts can log in and access their company data';
END $$;

-- Show all companies in the database
SELECT 
    company_name,
    admin_user_name,
    admin_user_email,
    industry,
    subscription_tier,
    status,
    created_at
FROM companies
ORDER BY created_at DESC;

-- Show all apps for companies
SELECT 
    c.company_name,
    ca.app_name,
    ca.enabled,
    ca.deployed_at
FROM companies c
JOIN company_apps ca ON c.id = ca.company_id
ORDER BY c.company_name, ca.app_name; 