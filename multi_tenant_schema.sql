-- ==============================================
-- MULTI-TENANT DATABASE SCHEMA
-- This creates the infrastructure for isolated company databases
-- ==============================================

-- Create tenant_configurations table to track all company databases
CREATE TABLE IF NOT EXISTS tenant_configurations (
    company_id UUID PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    schema_name VARCHAR(255) NOT NULL UNIQUE,
    db_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    connection_string TEXT,
    
    CONSTRAINT tenant_configurations_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_schema_name ON tenant_configurations(schema_name);
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_status ON tenant_configurations(status);
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_created_at ON tenant_configurations(created_at);

-- Enable RLS for tenant configurations
ALTER TABLE tenant_configurations ENABLE ROW LEVEL SECURITY;

-- Only NSight Admins can manage tenant configurations
CREATE POLICY "NSight Admins can manage tenant configurations" ON tenant_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'NSight Admin'
        )
    );

-- Grant permissions
GRANT ALL ON tenant_configurations TO authenticated;

-- Function to create a new tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(
    schema_name TEXT,
    company_id UUID,
    company_name TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if schema already exists
    IF EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = create_tenant_schema.schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % already exists', schema_name;
    END IF;
    
    -- Create the schema
    EXECUTE format('CREATE SCHEMA %I', schema_name);
    
    -- Log the creation
    RAISE NOTICE 'Created tenant schema: % for company: %', schema_name, company_name;
END;
$$;

-- Function to execute SQL in a specific tenant schema
CREATE OR REPLACE FUNCTION execute_tenant_schema(
    schema_name TEXT,
    sql_script TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate schema exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = execute_tenant_schema.schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % does not exist', schema_name;
    END IF;
    
    -- Execute the SQL script
    EXECUTE sql_script;
    
    -- Log the execution
    RAISE NOTICE 'Executed SQL in tenant schema: %', schema_name;
END;
$$;

-- Function to set search path for tenant
CREATE OR REPLACE FUNCTION set_tenant_search_path(schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Set search path to tenant schema and public
    EXECUTE format('SET search_path TO %I, public', schema_name);
    
    -- Log the change
    RAISE NOTICE 'Set search path to schema: %', schema_name;
END;
$$;

-- Function to drop a tenant schema (for cleanup)
CREATE OR REPLACE FUNCTION drop_tenant_schema(schema_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if schema exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata 
        WHERE schema_name = drop_tenant_schema.schema_name
    ) THEN
        RAISE EXCEPTION 'Schema % does not exist', schema_name;
    END IF;
    
    -- Drop the schema and all its objects
    EXECUTE format('DROP SCHEMA %I CASCADE', schema_name);
    
    -- Log the deletion
    RAISE NOTICE 'Dropped tenant schema: %', schema_name;
END;
$$;

-- Function to get tenant info by company ID
CREATE OR REPLACE FUNCTION get_tenant_info(company_id UUID)
RETURNS TABLE(
    schema_name TEXT,
    company_name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.schema_name,
        tc.company_name,
        tc.status,
        tc.created_at
    FROM tenant_configurations tc
    WHERE tc.company_id = get_tenant_info.company_id;
END;
$$;

-- Function to list all tenant schemas
CREATE OR REPLACE FUNCTION list_tenant_schemas()
RETURNS TABLE(
    company_id UUID,
    company_name TEXT,
    schema_name TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.company_id,
        tc.company_name,
        tc.schema_name,
        tc.status,
        tc.created_at
    FROM tenant_configurations tc
    ORDER BY tc.created_at DESC;
END;
$$;

-- Function to validate tenant access for a user
CREATE OR REPLACE FUNCTION validate_tenant_access(user_id UUID, company_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_company_id UUID;
    user_role TEXT;
BEGIN
    -- Get user's company and role
    SELECT up.company_id, up.role 
    INTO user_company_id, user_role
    FROM user_profiles up 
    WHERE up.id = user_id;
    
    -- NSight Admins can access any tenant
    IF user_role = 'NSight Admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Users can only access their own company's tenant
    IF user_company_id = company_id THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_tenant_schema(TEXT, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION execute_tenant_schema(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION set_tenant_search_path(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION drop_tenant_schema(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION get_tenant_info(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION list_tenant_schemas() TO authenticated;
GRANT EXECUTE ON FUNCTION validate_tenant_access(UUID, UUID) TO authenticated;

-- Create a view for company-tenant relationships
CREATE OR REPLACE VIEW company_tenant_info AS
SELECT 
    c.id as company_id,
    c.company_name,
    c.admin_user_email,
    c.status as company_status,
    c.created_at as company_created_at,
    tc.schema_name,
    tc.db_name,
    tc.status as tenant_status,
    tc.created_at as tenant_created_at,
    tc.connection_string
FROM companies c
LEFT JOIN tenant_configurations tc ON c.id = tc.company_id;

-- Grant access to the view
GRANT SELECT ON company_tenant_info TO authenticated;

-- Create trigger to automatically create tenant when company is created
CREATE OR REPLACE FUNCTION trigger_create_tenant_on_company_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- This will be called by the API, not automatically
    -- to give more control over the tenant creation process
    RETURN NEW;
END;
$$;

-- Comments for documentation
COMMENT ON TABLE tenant_configurations IS 'Tracks isolated database schemas for each company';
COMMENT ON FUNCTION create_tenant_schema(TEXT, UUID, TEXT) IS 'Creates a new isolated schema for a company';
COMMENT ON FUNCTION execute_tenant_schema(TEXT, TEXT) IS 'Executes SQL commands in a specific tenant schema';
COMMENT ON FUNCTION set_tenant_search_path(TEXT) IS 'Sets the search path to a specific tenant schema';
COMMENT ON FUNCTION validate_tenant_access(UUID, UUID) IS 'Validates if a user can access a specific tenant';
COMMENT ON VIEW company_tenant_info IS 'Combined view of companies and their tenant configurations';

-- Log completion
DO $$
BEGIN
    RAISE NOTICE '✅ Multi-tenant database schema created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Key components:';
    RAISE NOTICE '- tenant_configurations table for tracking company databases';
    RAISE NOTICE '- Schema creation and management functions';
    RAISE NOTICE '- Tenant access validation system';
    RAISE NOTICE '- Company-tenant relationship views';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update company creation API to use multi-tenant system';
    RAISE NOTICE '2. Update authentication to route users to correct tenant';
    RAISE NOTICE '3. Update dashboard components for tenant-specific data';
END $$; 