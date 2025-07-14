-- Companies Management Schema
-- This schema supports the NSight admin company creation and management system

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Step 1: Basic Company Information
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL DEFAULT 'Chemical Manufacturing',
    company_size VARCHAR(20) DEFAULT '1-50',
    website VARCHAR(500),
    country VARCHAR(100) DEFAULT 'United States',
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    
    -- Step 2: Primary Contact
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    contact_title VARCHAR(100) DEFAULT 'CEO',
    
    -- Step 3: Technical Configuration
    database_isolation VARCHAR(20) DEFAULT 'schema', -- 'schema' or 'database'
    data_retention VARCHAR(20) DEFAULT '7-years',
    backup_frequency VARCHAR(20) DEFAULT 'daily',
    api_rate_limit INTEGER DEFAULT 1000,
    
    -- Step 4: Security & Compliance
    data_residency VARCHAR(30) DEFAULT 'us-east',
    compliance_standards JSONB DEFAULT '["ISO9001"]'::jsonb,
    sso_enabled BOOLEAN DEFAULT false,
    two_factor_required BOOLEAN DEFAULT false,
    
    -- Step 5: Subscription & Billing
    subscription_tier VARCHAR(20) DEFAULT 'professional',
    billing_contact VARCHAR(255) NOT NULL,
    billing_email VARCHAR(255) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'invoice',
    
    -- Step 6: Initial Setup
    admin_user_name VARCHAR(255) NOT NULL,
    admin_user_email VARCHAR(255) NOT NULL,
    default_departments JSONB DEFAULT '["Production", "Quality Control", "Research"]'::jsonb,
    initial_apps JSONB DEFAULT '["formulas", "raw-materials"]'::jsonb,
    
    -- System fields
    status VARCHAR(20) DEFAULT 'Active',
    setup_complete BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID, -- References user who created the company
    
    -- Constraints
    CONSTRAINT companies_company_name_unique UNIQUE (company_name),
    CONSTRAINT companies_contact_email_check CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT companies_billing_email_check CHECK (billing_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT companies_admin_user_email_check CHECK (admin_user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT companies_subscription_tier_check CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    CONSTRAINT companies_database_isolation_check CHECK (database_isolation IN ('schema', 'database')),
    CONSTRAINT companies_status_check CHECK (status IN ('Active', 'Inactive', 'Suspended', 'Pending'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_company_name ON companies (company_name);
CREATE INDEX IF NOT EXISTS idx_companies_contact_email ON companies (contact_email);
CREATE INDEX IF NOT EXISTS idx_companies_subscription_tier ON companies (subscription_tier);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies (status);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies (created_at);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies (industry);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at_trigger
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_companies_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: Only NSight Admins can manage companies
CREATE POLICY companies_nsight_admin_policy ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'NSight Admin'
        )
    );

-- Grant permissions
GRANT ALL ON companies TO authenticated;

-- Create company_users junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'Employee',
    permissions JSONB DEFAULT '[]'::jsonb,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID REFERENCES user_profiles(id),
    status VARCHAR(20) DEFAULT 'Active',
    
    CONSTRAINT company_users_unique UNIQUE (company_id, user_id),
    CONSTRAINT company_users_role_check CHECK (role IN ('Admin', 'Manager', 'Employee', 'Viewer')),
    CONSTRAINT company_users_status_check CHECK (status IN ('Active', 'Inactive', 'Pending'))
);

-- Indexes for company_users
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON company_users (company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON company_users (user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_role ON company_users (role);

-- RLS for company_users
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_users_nsight_admin_policy ON company_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'NSight Admin'
        )
    );

GRANT ALL ON company_users TO authenticated;

-- Company apps configuration table
CREATE TABLE IF NOT EXISTS company_apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    app_id VARCHAR(50) NOT NULL, -- 'formulas', 'raw-materials', etc.
    app_name VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}'::jsonb,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deployed_by UUID REFERENCES user_profiles(id),
    
    CONSTRAINT company_apps_unique UNIQUE (company_id, app_id)
);

-- Indexes for company_apps  
CREATE INDEX IF NOT EXISTS idx_company_apps_company_id ON company_apps (company_id);
CREATE INDEX IF NOT EXISTS idx_company_apps_app_id ON company_apps (app_id);

-- RLS for company_apps
ALTER TABLE company_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY company_apps_nsight_admin_policy ON company_apps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'NSight Admin'
        )
    );

GRANT ALL ON company_apps TO authenticated;

-- Insert some sample data for testing (optional)
-- INSERT INTO companies (
--     company_name, industry, contact_name, contact_email, 
--     billing_contact, billing_email, admin_user_name, admin_user_email
-- ) VALUES (
--     'Test Chemical Co', 'Chemical Manufacturing', 'John Doe', 'john@testchemical.com',
--     'Jane Smith', 'billing@testchemical.com', 'John Doe', 'admin@testchemical.com'
-- );

-- Schema creation complete!
-- You can now use the companies, company_users, and company_apps tables 