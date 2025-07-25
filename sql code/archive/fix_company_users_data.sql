-- Simple fix for company_users table
-- Table already exists with correct structure, just need to add data

-- Clear existing data
TRUNCATE TABLE company_users;

-- Insert test data for Capacity Chemicals
-- Company ID: f42538be-9dcb-493a-9e2e-8b10691ace25
-- Admin user: admintest@capacity.com (ID: 8d3a8ac9-14fd-4761-b273-44191e9bab5c)
INSERT INTO company_users (company_id, user_id, role, permissions, status)
VALUES (
    'f42538be-9dcb-493a-9e2e-8b10691ace25',
    '8d3a8ac9-14fd-4761-b273-44191e9bab5c',
    'Admin',
    '[]'::jsonb,
    'Active'
);

-- Verify the insert worked
SELECT 'company_users table data:' as test_name;
SELECT id, company_id, user_id, role, permissions, status, added_at, created_at 
FROM company_users 
WHERE company_id = 'f42538be-9dcb-493a-9e2e-8b10691ace25';

-- Count users for this company
SELECT 'User count for Capacity Chemicals:' as test_name;
SELECT COUNT(*) as user_count
FROM company_users 
WHERE company_id = 'f42538be-9dcb-493a-9e2e-8b10691ace25'; 