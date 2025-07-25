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

-- Policy: Only NSight Admins can manage company_users (drop existing first)
DROP POLICY IF EXISTS company_users_nsight_admin_policy ON company_users;
CREATE POLICY company_users_nsight_admin_policy ON company_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.id = auth.uid() 
            AND user_profiles.role = 'NSight Admin'
        )
    );

-- Grant permissions
GRANT ALL ON company_users TO authenticated;

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '✅ company_users table created successfully!';
    RAISE NOTICE 'The multi-tenant system can now track user-company relationships.';
END $$; 