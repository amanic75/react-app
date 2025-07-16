# Verification Guide - Multi-Tenant Fixes

## What Was Fixed

### 1. ✅ Apple Dashboard User Isolation
**Issue**: Apple's dashboard was showing Capacity Chemicals users
**Fix**: Added company filtering to AdminDashboard component

### 2. ✅ Pre-installed Apps Not Showing
**Issue**: When creating a company and selecting apps, they weren't appearing
**Fix**: Updated company creation to add apps to both `company_apps` and `apps` tables

### 3. ✅ App Statistics
**Issue**: Apps showing "0 records" and "0 users" 
**Fix**: Created API endpoint and database function to fetch real statistics

## How to Verify

### Step 1: Run Database Migrations
```sql
-- In Supabase SQL Editor, run these in order:

-- 1. First run the app creation and stats script
-- Run contents of: fix_app_creation_and_stats.sql

-- 2. Verify apps were migrated
SELECT company_name, app_name, record_count, user_count 
FROM app_details_with_stats 
ORDER BY company_name, app_name;
```

### Step 2: Test Apple Dashboard
1. Login as Tim Cook (tim@apple.com)
2. Go to Dashboard
3. **Verify**: The Formulas, Raw Materials, and Suppliers cards should show:
   - Only Apple users (NOT Jean Brown, John Hopps, etc.)
   - Correct user counts for Apple company

### Step 3: Test App Creation
1. Login as NSight Admin
2. Go to Developer Mode
3. Create a new test company
4. Select apps to pre-install (e.g., Formulas, Suppliers)
5. After creation, switch to Existing Company Mode
6. Select your new company
7. **Verify**: The pre-installed apps appear in the "Select App" section

### Step 4: Test App Statistics
1. As Tim Cook, add some test data:
   - Create 2-3 formulas
   - Create 2-3 raw materials
   - Create 1-2 suppliers
2. Go back to NSight Admin → Existing Company Mode
3. Select Apple Test Company
4. **Verify**: The app cards show real counts:
   - Formulas: "3 records, 1 users"
   - Raw Materials: "3 records, 1 users"
   - Suppliers: "2 records, 1 users"

### Step 5: Cross-Company Verification
1. Login as Capacity Chemicals admin
2. **Verify**: You DON'T see any Apple data
3. The dashboard shows only Capacity users
4. Login as NSight Admin
5. **Verify**: You can see data from BOTH companies

## Troubleshooting

### If apps still show 0 records:
1. Make sure the SQL migration ran successfully
2. Check that data has company_id set:
   ```sql
   SELECT table_name, COUNT(*) as records
   FROM (
     SELECT 'formulas' as table_name, company_id FROM formulas
     UNION ALL
     SELECT 'raw_materials', company_id FROM raw_materials
     UNION ALL
     SELECT 'suppliers', company_id FROM suppliers
   ) t
   WHERE company_id IS NOT NULL
   GROUP BY table_name;
   ```

### If pre-installed apps don't appear:
1. Check the apps table:
   ```sql
   SELECT c.company_name, a.app_name, a.app_type, a.status
   FROM apps a
   JOIN companies c ON a.company_id = c.id
   ORDER BY c.company_name, a.app_name;
   ```

### If wrong users appear on dashboard:
1. Clear browser cache
2. Check the user's company association:
   ```sql
   SELECT u.email, c.company_name
   FROM company_users cu
   JOIN user_profiles u ON cu.user_id = u.id
   JOIN companies c ON cu.company_id = c.id
   WHERE u.email = 'USER_EMAIL_HERE';
   ```

## Success Criteria
✅ Each company admin sees only their company's users on the dashboard
✅ Pre-installed apps appear immediately after company creation
✅ App cards show accurate record and user counts
✅ Complete data isolation between companies
✅ NSight Admins can see everything 