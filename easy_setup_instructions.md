# Easy Demo Setup for Chemformation App

## Step 1: Run the Database Setup
In your Supabase SQL Editor, run the `database_complete_setup.sql` script. This will:
- Set up all the database schema
- Add user tracking and authentication
- Populate all the mock data (formulas, raw materials, suppliers)

## Step 2: Create Demo Users
Since Supabase auth requires proper user creation, create these users manually through the Supabase Auth interface:

### Option A: Through Supabase Dashboard
1. Go to Authentication > Users in your Supabase dashboard
2. Click "Add user" and create:
   - **admin@chemformation.com** / password123
   - **manager@chemformation.com** / password123  
   - **employee@chemformation.com** / password123

### Option B: Through Your App
1. Open your app at http://localhost:5187
2. Click "Sign up" and create the demo accounts
3. The user profiles will be automatically created with default employee role

## Step 3: Update User Roles (Optional)
If you want the proper roles (admin/manager), run this SQL after creating the users:

```sql
-- Update roles for demo users
UPDATE user_profiles 
SET role = 'admin', department = 'Management' 
WHERE email = 'admin@chemformation.com';

UPDATE user_profiles 
SET role = 'manager', department = 'Operations' 
WHERE email = 'manager@chemformation.com';

UPDATE user_profiles 
SET role = 'employee', department = 'Production' 
WHERE email = 'employee@chemformation.com';
```

## Step 4: Update Data Ownership (Optional)
To properly assign the mock data to demo users, first get their user IDs:

```sql
-- Get user IDs
SELECT id, email, first_name, last_name, role FROM user_profiles;
```

Then update the mock data with real user IDs:

```sql
-- Example: Replace the placeholder UUIDs with real ones
-- UPDATE raw_materials SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
-- UPDATE formulas SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
-- UPDATE suppliers SET created_by = 'REAL_ADMIN_UUID' WHERE created_by = '00000000-0000-0000-0000-000000000001';
```

## That's it! 🎉

You now have:
- ✅ Full authentication system
- ✅ Demo users with different roles
- ✅ All mock data (10 raw materials, 8 formulas, 8 suppliers)
- ✅ Proper user assignments and filtering
- ✅ All CRUD operations working

## Demo Credentials
- **Admin**: admin@chemformation.com / password123
- **Manager**: manager@chemformation.com / password123  
- **Employee**: employee@chemformation.com / password123

Each user will see different data based on what's assigned to them or created by them! 