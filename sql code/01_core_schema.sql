-- ==============================================
-- 01_CORE_SCHEMA.SQL
-- Core database schema for Chemical Manufacturing App
-- Consolidates: create_companies_schema.sql, create_apps_schema.sql, 
--               database_auth_setup.sql, and other schema files
-- ==============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- USER MANAGEMENT TABLES
-- ==============================================

-- User profiles table (enhanced from multiple sources)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'Employee' CHECK (role IN ('Employee', 'Capacity Admin', 'NSight Admin')),
  department TEXT,
  avatar_url TEXT,
  app_access TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity tracking
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login events tracking
CREATE TABLE IF NOT EXISTS login_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_role TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout', 'failed_login')),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  session_duration INTEGER, -- in seconds, for logout events
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for better performance
  INDEX idx_login_events_email (user_email),
  INDEX idx_login_events_created_at (created_at),
  INDEX idx_login_events_event_type (event_type)
);

-- ==============================================
-- COMPANY MANAGEMENT TABLES
-- ==============================================

-- Companies table (consolidated from multiple sources)
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Information
  company_name TEXT UNIQUE NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT,
  website TEXT,
  country TEXT NOT NULL DEFAULT 'United States',
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  
  -- Primary Contact
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_title TEXT,
  
  -- Technical Configuration
  database_isolation TEXT NOT NULL DEFAULT 'schema' CHECK (database_isolation IN ('schema', 'database', 'row')),
  data_retention TEXT NOT NULL DEFAULT '7-years',
  backup_frequency TEXT NOT NULL DEFAULT 'daily',
  api_rate_limit INTEGER NOT NULL DEFAULT 1000,
  
  -- Security & Compliance
  data_residency TEXT NOT NULL DEFAULT 'us-east',
  compliance_standards TEXT[] DEFAULT '{}',
  sso_enabled BOOLEAN NOT NULL DEFAULT false,
  two_factor_required BOOLEAN NOT NULL DEFAULT false,
  
  -- Subscription & Billing
  subscription_tier TEXT NOT NULL DEFAULT 'professional' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
  billing_contact TEXT NOT NULL,
  billing_email TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'invoice' CHECK (payment_method IN ('credit-card', 'invoice', 'wire')),
  
  -- Initial Setup
  admin_user_name TEXT NOT NULL,
  admin_user_email TEXT NOT NULL,
  default_departments TEXT[] DEFAULT '{"Production", "Quality Control", "Research"}',
  initial_apps TEXT[] DEFAULT '{}',
  
  -- System Fields
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  setup_complete BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company users junction table (consolidated from multiple versions)
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Employee' CHECK (role IN ('Admin', 'Manager', 'Employee')),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Pending')),
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique user per company
  UNIQUE(company_id, user_id)
);

-- Company apps configuration
CREATE TABLE IF NOT EXISTS company_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique app per company
  UNIQUE(company_id, app_id)
);

-- ==============================================
-- APPLICATION DATA TABLES
-- ==============================================

-- Apps registry (consolidated from multiple sources)
CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id TEXT UNIQUE NOT NULL,  -- Internal app identifier
  app_name TEXT NOT NULL,       -- Display name
  app_description TEXT,
  app_icon TEXT DEFAULT 'Database',
  app_color TEXT DEFAULT '#6B7280',
  schema_definition JSONB DEFAULT '{}',
  is_system_app BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generic app data storage
CREATE TABLE IF NOT EXISTS app_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_id TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,  -- 'formula', 'supplier', 'raw_material', etc.
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',  -- Array of user IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for better performance
  INDEX idx_app_data_app_id (app_id),
  INDEX idx_app_data_company_id (company_id),
  INDEX idx_app_data_data_type (data_type),
  INDEX idx_app_data_created_by (created_by)
);

-- ==============================================
-- LEGACY COMPATIBILITY TABLES
-- ==============================================

-- Raw materials (maintained for backward compatibility)
CREATE TABLE IF NOT EXISTS raw_materials (
  id BIGSERIAL PRIMARY KEY,
  material_name TEXT NOT NULL,
  supplier_name TEXT,
  cas_number TEXT,
  quantity TEXT,
  unit TEXT,
  cost DECIMAL(10,2),
  weight_volume TEXT,
  density TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formulas (maintained for backward compatibility)
CREATE TABLE IF NOT EXISTS formulas (
  id BIGSERIAL PRIMARY KEY,
  formula_name TEXT NOT NULL,
  chemical_composition TEXT NOT NULL,
  density DECIMAL(5,2),
  ph_level DECIMAL(4,2),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers (maintained for backward compatibility)
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================
-- MULTI-TENANT SUPPORT
-- ==============================================

-- Tenant configurations for advanced isolation
CREATE TABLE IF NOT EXISTS tenant_configurations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tenant_name TEXT NOT NULL,
  database_name TEXT,
  schema_name TEXT,
  connection_config JSONB DEFAULT '{}',
  isolation_level TEXT NOT NULL DEFAULT 'schema' CHECK (isolation_level IN ('shared', 'schema', 'database')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'migrating')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(tenant_name)
);

-- ==============================================
-- AUDIT AND VERIFICATION
-- ==============================================

-- Material verification log
CREATE TABLE IF NOT EXISTS material_verification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id BIGINT REFERENCES raw_materials(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES auth.users(id),
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  
  INDEX idx_verification_log_material_id (material_id),
  INDEX idx_verification_log_status (verification_status)
);

-- ==============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all relevant tables
DO $$
DECLARE
    table_name TEXT;
    tables_with_updated_at TEXT[] := ARRAY[
        'user_profiles', 'companies', 'company_users', 'company_apps', 
        'apps', 'app_data', 'raw_materials', 'formulas', 'suppliers',
        'tenant_configurations'
    ];
BEGIN
    FOREACH table_name IN ARRAY tables_with_updated_at
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at 
                BEFORE UPDATE ON %I 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;

-- ==============================================
-- INITIAL DATA SETUP
-- ==============================================

-- Insert default app templates
INSERT INTO apps (app_id, app_name, app_description, app_icon, app_color) VALUES
('formulas', 'Formulas', 'Chemical formula management system', 'Database', '#10B981'),
('suppliers', 'Suppliers', 'Supplier relationship management', 'Building2', '#3B82F6'),
('raw-materials', 'Raw Materials', 'Raw material inventory tracking', 'FlaskConical', '#F59E0B'),
('products', 'Products', 'Product catalog management', 'Table', '#8B5CF6'),
('quality-control', 'Quality Control', 'Quality control and testing', 'Settings', '#EF4444'),
('production', 'Production', 'Production planning and tracking', 'Zap', '#06B6D4'),
('inventory', 'Inventory', 'Inventory management system', 'Database', '#84CC16'),
('reports', 'Reports', 'Reporting and analytics dashboard', 'Table', '#F97316')
ON CONFLICT (app_id) DO NOTHING;

-- Schema creation completed
SELECT 'Core schema setup completed successfully!' as status; 