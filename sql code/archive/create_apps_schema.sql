-- Create apps schema for dynamic app management
-- This implements Option 1: Dynamic Schema Approach

-- Apps metadata table
CREATE TABLE IF NOT EXISTS apps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    app_name VARCHAR(255) NOT NULL,
    app_description TEXT,
    app_icon VARCHAR(50) DEFAULT 'Database',
    app_color VARCHAR(7) DEFAULT '#3B82F6',
    category VARCHAR(50) DEFAULT 'business',
    table_name VARCHAR(255) NOT NULL, -- The logical table name for this app's data
    
    -- JSON configuration for the app
    config_json JSONB DEFAULT '{}',
    
    -- Database schema definition as JSON
    schema_json JSONB DEFAULT '{}',
    
    -- UI configuration
    ui_config JSONB DEFAULT '{
        "showInDashboard": true,
        "enableSearch": true,
        "enableFilters": true,
        "enableExport": true
    }',
    
    -- Permission configuration
    permissions_config JSONB DEFAULT '{
        "adminAccess": ["create", "read", "update", "delete"],
        "managerAccess": ["create", "read", "update"],
        "userAccess": ["read"]
    }',
    
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    
    -- Ensure unique app names per company
    UNIQUE(company_id, app_name),
    -- Ensure unique table names per company
    UNIQUE(company_id, table_name)
);

-- Dynamic data storage table
CREATE TABLE IF NOT EXISTS app_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    record_id VARCHAR(255) NOT NULL, -- Logical record ID within the app
    data_json JSONB NOT NULL, -- The actual data for this record
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    -- Ensure unique record IDs per app
    UNIQUE(app_id, record_id)
);

-- User permissions per app
CREATE TABLE IF NOT EXISTS app_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'admin', 'manager', 'user'
    permissions_json JSONB DEFAULT '[]', -- Custom permissions for this user
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    granted_by UUID REFERENCES user_profiles(id),
    
    -- Ensure unique user-app combinations
    UNIQUE(user_id, app_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_apps_company_id ON apps(company_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at);

CREATE INDEX IF NOT EXISTS idx_app_data_app_id ON app_data(app_id);
CREATE INDEX IF NOT EXISTS idx_app_data_record_id ON app_data(record_id);
CREATE INDEX IF NOT EXISTS idx_app_data_created_at ON app_data(created_at);
CREATE INDEX IF NOT EXISTS idx_app_data_data_json ON app_data USING GIN(data_json);

CREATE INDEX IF NOT EXISTS idx_app_permissions_user_id ON app_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_app_permissions_app_id ON app_permissions(app_id);

-- Enable Row Level Security (RLS)
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for apps table
CREATE POLICY "Apps are viewable by company members" ON apps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.user_id = auth.uid() 
            AND company_users.company_id = apps.company_id
            AND company_users.status = 'Active'
        ) OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        )
    );

CREATE POLICY "Apps are insertable by admin users" ON apps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        ) OR EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.user_id = auth.uid() 
            AND company_users.company_id = apps.company_id
            AND company_users.role IN ('Admin', 'Manager')
            AND company_users.status = 'Active'
        )
    );

CREATE POLICY "Apps are updatable by admin users" ON apps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        ) OR EXISTS (
            SELECT 1 FROM company_users 
            WHERE company_users.user_id = auth.uid() 
            AND company_users.company_id = apps.company_id
            AND company_users.role IN ('Admin', 'Manager')
            AND company_users.status = 'Active'
        )
    );

-- RLS Policies for app_data table
CREATE POLICY "App data is viewable by users with app access" ON app_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM apps 
            INNER JOIN company_users ON company_users.company_id = apps.company_id
            WHERE apps.id = app_data.app_id 
            AND company_users.user_id = auth.uid()
            AND company_users.status = 'Active'
        ) OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        )
    );

CREATE POLICY "App data is insertable by users with create permissions" ON app_data
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM apps 
            INNER JOIN company_users ON company_users.company_id = apps.company_id
            WHERE apps.id = app_data.app_id 
            AND company_users.user_id = auth.uid()
            AND company_users.status = 'Active'
        ) OR EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        )
    );

-- RLS Policies for app_permissions table
CREATE POLICY "App permissions are viewable by admin users" ON app_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role IN ('NSight Admin', 'Capacity Admin')
        ) OR EXISTS (
            SELECT 1 FROM apps 
            INNER JOIN company_users ON company_users.company_id = apps.company_id
            WHERE apps.id = app_permissions.app_id 
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('Admin', 'Manager')
            AND company_users.status = 'Active'
        )
    );

-- Update trigger for apps table
CREATE OR REPLACE FUNCTION update_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_apps_updated_at();

-- Update trigger for app_data table  
CREATE OR REPLACE FUNCTION update_app_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_app_data_updated_at
    BEFORE UPDATE ON app_data
    FOR EACH ROW
    EXECUTE FUNCTION update_app_data_updated_at();

-- Sample data for testing (optional)
-- Note: Replace the UUID values below with actual company and user IDs from your database
-- INSERT INTO apps (company_id, app_name, app_description, app_icon, app_color, table_name, schema_json, created_by) 
-- VALUES 
-- ('your-company-uuid-here', 'Customer Database', 'Manage customer information and contacts', 'Users', '#3B82F6', 'customers', 
-- '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "email", "type": "email", "required": true}, {"name": "phone", "type": "phone", "required": false}]}', 
-- 'your-user-uuid-here'),
-- ('your-company-uuid-here', 'Product Catalog', 'Manage product inventory and details', 'Database', '#10B981', 'products',
-- '{"fields": [{"name": "name", "type": "text", "required": true}, {"name": "price", "type": "currency", "required": true}, {"name": "description", "type": "textarea", "required": false}]}',
-- 'your-user-uuid-here')
-- ON CONFLICT (company_id, app_name) DO NOTHING; 