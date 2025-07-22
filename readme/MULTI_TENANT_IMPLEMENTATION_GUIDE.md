# Multi-Tenant Implementation Guide

## Overview

This guide shows how to implement and use the new multi-tenant architecture where each company gets its own isolated database and admin account. The system automatically provisions everything when a new company is created.

## Architecture Changes

### Before (Single-Tenant)
```
┌─────────────────────────────────────────────────────────────┐
│                    Single Database                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Company   │  │   Company   │  │   Company   │        │
│  │      A      │  │      B      │  │      C      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│           All companies share the same tables              │
└─────────────────────────────────────────────────────────────┘
```

### After (Multi-Tenant)
```
┌─────────────────────────────────────────────────────────────┐
│                    Master Database                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Schema A  │    │   Schema B  │    │   Schema C  │     │
│  │ (Company A) │    │ (Company B) │    │ (Company C) │     │
│  │             │    │             │    │             │     │
│  │ - formulas  │    │ - formulas  │    │ - formulas  │     │
│  │ - suppliers │    │ - suppliers │    │ - suppliers │     │
│  │ - users     │    │ - users     │    │ - users     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│           Each company has isolated database schema         │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Database Setup

1. **Run the Multi-Tenant Schema Setup**
   ```sql
   -- In your Supabase SQL Editor, run:
   \i multi_tenant_schema.sql
   ```

2. **Verify the Infrastructure**
   ```sql
   -- Check that the required tables and functions exist
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'tenant_configurations';
   
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_name IN ('create_tenant_schema', 'execute_tenant_schema');
   ```

### Step 2: Update Your Application

1. **Install Dependencies**
   ```bash
   # If not already installed
   npm install @supabase/supabase-js
   ```

2. **Update Environment Variables**
   ```bash
   # .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Update Your Main Application**
   ```jsx
   // src/main.jsx
   import { MultiTenantAuthProvider } from './contexts/MultiTenantAuthContext';
   import MultiTenantNsightDashboard from './components/shared/MultiTenantNsightDashboard';
   
   // Replace existing auth provider with multi-tenant version
   <MultiTenantAuthProvider>
     <App />
   </MultiTenantAuthProvider>
   ```

4. **Update Dashboard Routing**
   ```jsx
   // src/pages/DashboardPage.jsx
   import { useMultiTenantAuth } from '../contexts/MultiTenantAuthContext';
   import MultiTenantNsightDashboard from '../components/shared/MultiTenantNsightDashboard';
   
   const DashboardPage = () => {
     const { userProfile } = useMultiTenantAuth();
     
     switch (userProfile?.role) {
       case 'NSight Admin':
         return <MultiTenantNsightDashboard />;
       // ... other cases
     }
   };
   ```

### Step 3: API Endpoint Setup

1. **Create API Route File**
   ```javascript
   // api/admin/multi-tenant-companies.js
   // (Already created in the implementation above)
   ```

2. **Update Your Server Configuration**
   ```javascript
   // server/dev-server.js or similar
   // Ensure the API route is properly configured for your setup
   ```

### Step 4: Create Your First Multi-Tenant Company

1. **Log in as NSight Admin**
   - Use your NSight admin credentials
   - Navigate to the NSight Dashboard

2. **Create a New Company**
   - Click "Create Multi-Tenant Company"
   - Fill in the form:
     - Company Name: "NVIDIA Corporation"
     - Admin User Name: "John Smith"
     - Admin User Email: "admin@nvidia.com"
     - Industry: "Technology"
     - Initial Apps: [Select desired apps]

3. **Company Creation Process**
   ```
   🏗️ Creating multi-tenant company: NVIDIA Corporation
   ✅ Company record created: uuid-here
   ✅ Tenant database created: tenant_uuid_here
   ✅ Admin account created: admin@nvidia.com
   ✅ Initial apps deployed: ['formulas', 'suppliers', 'raw-materials']
   ```

4. **Save Admin Credentials**
   - Email: admin@nvidia.com
   - Password: ChangeMe123! (default)
   - Schema: tenant_uuid_here

### Step 5: Test Company Admin Access

1. **Log Out of NSight Admin**
   - Sign out of your NSight admin account

2. **Log In as Company Admin**
   - Use the credentials provided during company creation
   - Email: admin@nvidia.com
   - Password: ChangeMe123!

3. **Verify Isolated Access**
   - Should see only NVIDIA's data
   - Should see only NVIDIA's apps
   - Should see only NVIDIA's users
   - Cannot see other companies' data

4. **Change Default Password**
   - Go to Settings → Change Password
   - Update from default password to secure password

## Usage Examples

### Example 1: Creating Multiple Companies

```javascript
// Create NVIDIA
await fetch('/api/admin/multi-tenant-companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'NVIDIA Corporation',
    adminUserName: 'John Smith',
    adminUserEmail: 'admin@nvidia.com',
    industry: 'Technology',
    initialApps: ['formulas', 'suppliers', 'raw-materials']
  })
});

// Create Apple
await fetch('/api/admin/multi-tenant-companies', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyName: 'Apple Inc',
    adminUserName: 'Jane Doe',
    adminUserEmail: 'admin@apple.com',
    industry: 'Technology',
    initialApps: ['formulas', 'analytics']
  })
});
```

### Example 2: Tenant Data Access

```javascript
// From company admin dashboard
const { getDatabaseConnection } = useMultiTenantAuth();

// Get tenant-specific data
const db = getDatabaseConnection();
const { data: formulas } = await db
  .from('formulas')
  .select('*'); // Only sees their company's formulas

// NSight admin can see all companies
const { data: companies } = await db
  .from('companies')
  .select('*'); // Sees all companies
```

### Example 3: Company Admin User Management

```javascript
// Company admin creating users in their tenant
const { createTenantUser } = useMultiTenantAuth();

const result = await createTenantUser({
  email: 'employee@nvidia.com',
  firstName: 'Alice',
  lastName: 'Johnson',
  role: 'Employee',
  department: 'Engineering',
  appAccess: ['formulas', 'suppliers']
});
```

## Database Schema Details

### Master Database Tables

1. **companies** - Company records
2. **tenant_configurations** - Tenant database configurations
3. **user_profiles** - NSight admin profiles (global)

### Tenant Database Tables (per company)

1. **formulas** - Company-specific formulas
2. **suppliers** - Company-specific suppliers
3. **raw_materials** - Company-specific raw materials
4. **apps** - Company-specific app configurations
5. **app_data** - Dynamic app data storage
6. **user_profiles** - Company-specific user profiles

### Row Level Security (RLS)

Each tenant database has RLS policies that ensure:
- Users can only access their own company's data
- Company admins can manage their company's users
- NSight admins can access all companies

## Testing & Validation

### Test Scenario 1: Company Isolation

1. Create Company A with admin@companyA.com
2. Create Company B with admin@companyB.com
3. Log in as Company A admin
4. Create some formulas and users
5. Log in as Company B admin
6. Verify you cannot see Company A's data

### Test Scenario 2: Admin Creation

1. Create a new company via NSight dashboard
2. Note the generated admin credentials
3. Log out and log in with admin credentials
4. Verify admin can access company dashboard
5. Verify admin can create users in their company

### Test Scenario 3: Database Health

1. Check tenant configurations:
   ```sql
   SELECT * FROM tenant_configurations;
   ```
2. Verify schemas exist:
   ```sql
   SELECT schema_name FROM information_schema.schemata 
   WHERE schema_name LIKE 'tenant_%';
   ```
3. Check schema contents:
   ```sql
   SET search_path TO tenant_uuid_here;
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'tenant_uuid_here';
   ```

## Troubleshooting

### Common Issues

1. **Schema Creation Fails**
   - Check service role permissions
   - Verify database functions exist
   - Check for naming conflicts

2. **Admin User Can't Log In**
   - Verify user was created in auth.users
   - Check user metadata contains company_id
   - Verify tenant schema exists

3. **Data Access Issues**
   - Check RLS policies are enabled
   - Verify user has correct company_id
   - Check tenant connection routing

### Debug Commands

```sql
-- Check tenant status
SELECT * FROM tenant_configurations WHERE company_id = 'uuid-here';

-- Check user metadata
SELECT id, email, user_metadata FROM auth.users WHERE email = 'admin@company.com';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'tenant_uuid_here';
```

## Migration from Single-Tenant

### For Existing Companies

1. **Backup Current Data**
   ```sql
   -- Export existing data
   COPY companies TO '/tmp/companies_backup.csv' WITH CSV HEADER;
   COPY formulas TO '/tmp/formulas_backup.csv' WITH CSV HEADER;
   -- etc.
   ```

2. **Create Multi-Tenant Companies**
   - Use the NSight dashboard to recreate companies
   - This will create isolated databases for each

3. **Migrate Data**
   ```sql
   -- For each company, import data into their tenant schema
   SET search_path TO tenant_companyA_uuid;
   COPY formulas FROM '/tmp/formulas_companyA.csv' WITH CSV HEADER;
   -- etc.
   ```

4. **Update User Accounts**
   - Company admins need to be recreated with proper metadata
   - Employee accounts need company_id in user_metadata

## Benefits of Multi-Tenant Architecture

1. **True Data Isolation** - Each company has completely separate data
2. **Scalability** - Easy to add new companies without affecting others
3. **Security** - No risk of cross-company data access
4. **Compliance** - Easier to meet data residency requirements
5. **Customization** - Each company can have different apps and schemas
6. **Performance** - Smaller datasets per company = better performance

## Next Steps

1. **Implement the Database Setup** - Run the SQL schema
2. **Deploy the Code Changes** - Update your application
3. **Test with Sample Companies** - Create test companies
4. **Migrate Existing Data** - If you have existing companies
5. **Train Your Team** - On the new multi-tenant system

## Support

For issues or questions about the multi-tenant implementation:
1. Check the troubleshooting section above
2. Review the database logs for errors
3. Verify all environment variables are set correctly
4. Test with a simple company creation first

The multi-tenant system provides true isolation and scalability for your NSight consulting business while maintaining the same user experience for each company's admin and employees. 