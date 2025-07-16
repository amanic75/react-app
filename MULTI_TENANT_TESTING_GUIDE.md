# Multi-Tenant Data Isolation Testing Guide

## Overview
This guide helps verify that multi-tenant data isolation is working correctly across all modules.

## Setup Steps

### 1. Run the Database Migration
```sql
-- In Supabase SQL Editor, run:
-- Contents of add_company_isolation_to_data_tables.sql
```

### 2. Fix Tim Cook's Admin Role (if not already done)
```sql
-- Run the contents of fix_tim_cook_admin.sql
```

## Testing Scenarios

### Test 1: Company Admin Data Isolation

1. **Login as Tim Cook (Apple Admin)**
   - Email: tim@apple.com
   - Navigate to Formulas, Raw Materials, Suppliers
   - Should see: NO DATA (empty lists)
   - This confirms Apple has no data yet

2. **Create Apple-specific Data**
   - Add a new Formula: "Apple Special Formula"
   - Add a new Raw Material: "Apple Material A"
   - Add a new Supplier: "Apple Supplier Inc"

3. **Login as a Capacity Chemicals Admin**
   - Navigate to Formulas, Raw Materials, Suppliers
   - Should NOT see: Any Apple data
   - Should see: Only Capacity Chemicals data

### Test 2: Cross-Company Verification

1. **Login as NSight Admin**
   - Navigate to each module
   - Should see: ALL data from ALL companies
   - Verify you can see both Apple and Capacity data

2. **Check Database Directly**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT 
     f.name as formula_name,
     c.company_name,
     f.company_id
   FROM formulas f
   JOIN companies c ON f.company_id = c.id
   ORDER BY c.company_name, f.name;
   ```

### Test 3: User Management Isolation

1. **As Tim Cook**
   - Go to User Management
   - Should see: Only Apple users
   - Add a new user: "steve@apple.com"

2. **As Capacity Admin**
   - Go to User Management
   - Should NOT see: steve@apple.com
   - Should see: Only Capacity users

### Test 4: Data Creation Verification

1. **As Tim Cook, try to create data**
   - All creates should succeed
   - All data should be tagged with Apple's company_id

2. **Verify in Database**
   ```sql
   -- Check that all Apple data has correct company_id
   SELECT 
     'Formulas' as type,
     COUNT(*) as count
   FROM formulas
   WHERE company_id = (SELECT id FROM companies WHERE company_name LIKE '%Apple%')
   
   UNION ALL
   
   SELECT 
     'Raw Materials' as type,
     COUNT(*) as count
   FROM raw_materials
   WHERE company_id = (SELECT id FROM companies WHERE company_name LIKE '%Apple%')
   
   UNION ALL
   
   SELECT 
     'Suppliers' as type,
     COUNT(*) as count
   FROM suppliers
   WHERE company_id = (SELECT id FROM companies WHERE company_name LIKE '%Apple%');
   ```

## Expected Results

✅ **Correct Behavior:**
- Each company sees ONLY their own data
- Company admins can manage ONLY their users
- NSight Admins see ALL data across companies
- New data is automatically tagged with company_id

❌ **Issues to Watch For:**
- Seeing data from other companies
- Unable to create new data
- Data created without company_id
- Users appearing in wrong company

## Troubleshooting

### If Tim Cook still sees Capacity data:
1. Clear browser cache and cookies
2. Log out and log back in
3. Check RLS policies are enabled:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename IN ('formulas', 'raw_materials', 'suppliers');
   ```

### If data creation fails:
1. Check user has a company_id:
   ```sql
   SELECT cu.*, c.company_name
   FROM company_users cu
   JOIN companies c ON cu.company_id = c.id
   WHERE cu.user_id = 'USER_ID_HERE';
   ```

2. Verify columns exist:
   ```sql
   SELECT column_name 
   FROM information_schema.columns
   WHERE table_name IN ('formulas', 'raw_materials', 'suppliers')
   AND column_name = 'company_id';
   ``` 