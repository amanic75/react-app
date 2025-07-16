-- Drop the table if it exists to start fresh
DROP TABLE IF EXISTS company_users;

-- Create company_users table (simplified version without foreign keys)
CREATE TABLE company_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'Employee',
    permissions JSONB DEFAULT '[]'::jsonb,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by UUID,
    status VARCHAR(20) DEFAULT 'Active',
    
    CONSTRAINT company_users_unique UNIQUE (company_id, user_id),
    CONSTRAINT company_users_role_check CHECK (role IN ('Admin', 'Manager', 'Employee', 'Viewer')),
    CONSTRAINT company_users_status_check CHECK (status IN ('Active', 'Inactive', 'Pending'))
);

-- Create indexes
CREATE INDEX idx_company_users_company_id ON company_users (company_id);
CREATE INDEX idx_company_users_user_id ON company_users (user_id);
CREATE INDEX idx_company_users_role ON company_users (role);

-- Enable RLS
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for all operations
CREATE POLICY company_users_policy ON company_users
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON company_users TO authenticated;
GRANT ALL ON company_users TO anon;

-- Test the table creation
INSERT INTO company_users (company_id, user_id, role, status) 
VALUES ('f42538be-9dcb-493a-9e2e-8b10691ace25', '8d3a8ac9-14fd-4761-b273-44191e9bab5c', 'Admin', 'Active')
ON CONFLICT (company_id, user_id) DO UPDATE SET 
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- Display results
SELECT 'Table created successfully' AS message;
SELECT * FROM company_users; 