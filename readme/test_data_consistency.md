# Data Consistency Testing Guide

This guide helps you test that the data is now consistent between the NSight admin dashboard's "existing company mode" and the actual company admin accounts.

## Setup

1. **Run the companies schema setup** (if not already done):
   ```sql
   -- Run create_companies_schema.sql in your Supabase SQL Editor
   ```

2. **Create sample companies**:
   ```sql
   -- Run create_sample_companies.sql in your Supabase SQL Editor
   ```

## Test Process

### Step 1: Check Initial State

1. **Login as NSight Admin**:
   - Email: `nsight@nsight-inc.com`
   - Password: `password`

2. **Navigate to Existing Company Mode**:
   - Go to Dashboard → Existing Company Mode
   - You should see the 3 sample companies:
     - Capacity Chemicals (admin@capacity-chemicals.com)
     - ChemTech Solutions (sarah.admin@chemtech-solutions.com)
     - Industrial Formulators Inc (david.admin@industrial-formulators.com)

3. **Check User Profiles**:
   ```sql
   -- Check if admin users exist
   SELECT email, first_name, last_name, role 
   FROM user_profiles 
   WHERE email IN (
     'admin@capacity-chemicals.com',
     'sarah.admin@chemtech-solutions.com',
     'david.admin@industrial-formulators.com'
   );
   ```
   
   Initially, these users should **NOT** exist yet.

### Step 2: Run Sync

1. **In NSight Admin Dashboard**:
   - Click the "Sync Companies" button
   - Wait for the sync to complete
   - You should see a success message like: "Sync completed: 3 users created, 3 companies linked, 0 errors"

2. **Verify User Creation**:
   ```sql
   -- Check that admin users were created
   SELECT email, first_name, last_name, role, created_at 
   FROM user_profiles 
   WHERE email IN (
     'admin@capacity-chemicals.com',
     'sarah.admin@chemtech-solutions.com',
     'david.admin@industrial-formulators.com'
   );
   ```

3. **Verify Company Linking**:
   ```sql
   -- Check that users are linked to companies
   SELECT 
     c.company_name,
     up.email,
     up.first_name,
     up.last_name,
     cu.role,
     cu.status
   FROM companies c
   JOIN company_users cu ON c.id = cu.company_id
   JOIN user_profiles up ON cu.user_id = up.id
   WHERE c.company_name IN ('Capacity Chemicals', 'ChemTech Solutions', 'Industrial Formulators Inc');
   ```

### Step 3: Test Admin Login

1. **Try logging in as company admin**:
   - Email: `admin@capacity-chemicals.com`
   - Password: `ChangeMe123!` (default password created by sync)

2. **Verify admin dashboard access**:
   - Should see the AdminDashboard (for Capacity Admin role)
   - Should have access to formulas, suppliers, raw materials

3. **Check company data consistency**:
   - The admin should only see data relevant to their company
   - The user count and app information should match what's shown in NSight admin

### Step 4: Test Data Consistency

1. **In NSight Admin Dashboard**:
   - View company details
   - Note user count, apps, and admin email

2. **In Company Admin Dashboard**:
   - View user management
   - Check accessible apps
   - Verify company information

3. **Cross-Reference**:
   - User count should match between both views
   - App access should be consistent
   - Admin user email should be displayed correctly

## Expected Results

### Before Sync
- ✅ Companies exist in NSight admin dashboard
- ❌ No corresponding admin user accounts
- ❌ No company-user linkages
- ❌ Admin users cannot log in

### After Sync
- ✅ Companies exist in NSight admin dashboard
- ✅ Admin user accounts created with Capacity Admin role
- ✅ Companies linked to their admin users via company_users table
- ✅ Admin users can log in and access their company data
- ✅ Data is consistent between both views

## Troubleshooting

### If sync fails:
1. Check Supabase logs for errors
2. Verify environment variables are set
3. Check that companies table has admin_user_email populated
4. Ensure user_profiles table exists and has correct constraints

### If users can't login:
1. Check that users were created in auth.users table
2. Verify default password is `ChangeMe123!`
3. Check that user_profiles has correct role assignment

### If data is inconsistent:
1. Verify company_users table has correct linkages
2. Check that user roles are set to 'Capacity Admin'
3. Ensure company apps are properly configured

## Success Criteria

✅ **Data Consistency Achieved** when:
1. NSight admin can see all companies with their admin emails
2. Company admin users can log in successfully
3. Company admins see data relevant to their company only
4. User counts and app information match between both views
5. Sync process creates missing admin accounts automatically
6. New company creation automatically creates admin accounts 