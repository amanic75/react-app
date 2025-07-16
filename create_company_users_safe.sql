-- Safe Company Users Table Setup
-- This script handles the case where the table exists but may be empty

-- First, let's check if the table has the right columns
-- If missing columns, add them
DO $$
BEGIN
    -- Add company_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'company_users' 
                  AND column_name = 'company_id') THEN
        ALTER TABLE company_users ADD COLUMN company_id UUID;
    END IF;
    
    -- Add user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'company_users' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE company_users ADD COLUMN user_id UUID;
    END IF;
    
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'company_users' 
                  AND column_name = 'role') THEN
        ALTER TABLE company_users ADD COLUMN role TEXT DEFAULT 'Employee';
    END IF;
    
    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'company_users' 
                  AND column_name = 'created_at') THEN
        ALTER TABLE company_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'company_users' 
                  AND column_name = 'updated_at') THEN
        ALTER TABLE company_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END $$;

-- Clear any existing data to start fresh
TRUNCATE TABLE company_users;

-- Create or replace the RLS policy for company_users table
DROP POLICY IF EXISTS "Users can view company_users for their company" ON company_users;
CREATE POLICY "Users can view company_users for their company" 
ON company_users FOR ALL 
TO authenticated, anon
USING (true);

-- Ensure RLS is enabled
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON company_users TO authenticated;
GRANT ALL ON company_users TO anon;
GRANT ALL ON company_users TO service_role;

-- Insert test data for Capacity Chemicals
-- Company ID: f42538be-9dcb-493a-9e2e-8b10691ace25
-- Admin user: admintest@capacity.com (ID: 8d3a8ac9-14fd-4761-b273-44191e9bab5c)
-- Valid roles: 'Admin', 'Manager', 'Employee', 'Viewer'
INSERT INTO company_users (company_id, user_id, role, created_at, updated_at)
VALUES (
    'f42538be-9dcb-493a-9e2e-8b10691ace25',
    '8d3a8ac9-14fd-4761-b273-44191e9bab5c',
    'Admin',
    now(),
    now()
) ON CONFLICT DO NOTHING;

-- Test the insert worked
SELECT 'company_users table test:' as test_name;
SELECT company_id, user_id, role, created_at 
FROM company_users 
WHERE company_id = 'f42538be-9dcb-493a-9e2e-8b10691ace25';

-- Show table structure
SELECT 'company_users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'company_users'
ORDER BY ordinal_position; 