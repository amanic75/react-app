# Employee Dashboard Role Detection Issue

## Problem Description
When employees with @capacity.com email addresses log in, they briefly see the Admin Dashboard before the correct Employee Dashboard loads. This happens because the system is incorrectly detecting them as "Capacity Admin" instead of "Employee".

## Root Cause Analysis
The issue stems from domain-based role assignment that was previously implemented. Even after removing the domain-based logic from the frontend, the user's auth session metadata still contains the old "Capacity Admin" role, which overrides the database role during the initial loading phase.

## What We've Done

### 1. Removed Domain-Based Role Assignment
- **File**: `src/contexts/AuthContext.jsx`
- **Changes**: Removed logic that automatically assigned "Capacity Admin" role to @capacity.com emails
- **Lines**: 30-32 and 254-256 (removed domain-based role detection)

### 2. Fixed API Default Role
- **File**: `api/admin/companies.js`
- **Changes**: Changed default role from "Capacity Admin" to "Employee"
- **Line**: 1133 (changed `'Capacity Admin'` to `'Employee'`)

### 3. Updated Database Roles
- **File**: `sql code/fix_all_employee_roles.sql`
- **Action**: Updated all @capacity.com users with "Capacity Admin" role to "Employee" role
- **SQL**: `UPDATE user_profiles SET role = 'Employee' WHERE email LIKE '%@capacity.com' AND role = 'Capacity Admin'`

### 4. Updated Auth Metadata
- **File**: `sql code/update_auth_metadata.sql`
- **Action**: Updated user's auth session metadata to have correct role
- **SQL**: Updated `auth.users.raw_user_meta_data` to set `role: "Employee"`

### 5. Added Loading State Protection
- **File**: `src/pages/DashboardPage.jsx`
- **Changes**: Added condition to prevent dashboard rendering until userProfile is available
- **Lines**: Added userProfile validation before calling renderDashboard()

## Current State
- Database shows correct role: `role: 'Employee'`
- Auth metadata shows correct role: `role: "Employee"`
- User profile in database is correct
- But users still see brief glimpse of Admin Dashboard

## Debug Information
From console logs, we can see:
1. **Auth session metadata**: `session.user.user_metadata: {role: "Capacity Admin"}` (initially)
2. **Database response**: `data: {role: 'Employee'}` (correct)
3. **Profile returned**: `profile from database: {role: 'Capacity Admin'}` (wrong)

## Best Guess: Why It's Not Working

The issue is likely a **timing/race condition** in the authentication flow:

1. **Initial Load**: Auth session loads with old metadata containing "Capacity Admin"
2. **Profile Fetch**: Database returns correct "Employee" role
3. **Fallback Logic**: When profile fetch fails or times out, `createProfileFromAuth()` is called with the session user that still has "Capacity Admin" in metadata
4. **State Update**: The wrong profile gets set in state, causing Admin Dashboard to render
5. **Subsequent Updates**: Later, the correct profile loads and switches to Employee Dashboard

## Potential Solutions to Try

### Option 1: Clear Auth Session Cache
The user needs to completely sign out and sign back in to refresh the auth session metadata.

### Option 2: Fix the Fallback Logic
Modify `createProfileFromAuth()` to ignore session metadata and always default to "Employee" role.

### Option 3: Add Role Validation
Add a check in the dashboard rendering to ensure the role matches the user's actual permissions.

### Option 4: Implement Proper Loading States
Add more granular loading states to prevent any dashboard rendering until the correct profile is confirmed.

## Key Files to Investigate
- `src/contexts/AuthContext.jsx` - Authentication flow and profile creation
- `src/pages/DashboardPage.jsx` - Dashboard rendering logic
- `api/admin/companies.js` - API role assignment
- Database: `user_profiles` table and `auth.users` table

## Next Steps
1. Test complete sign out/sign in cycle
2. If that doesn't work, investigate the fallback logic in `createProfileFromAuth()`
3. Consider implementing role validation in the dashboard rendering
4. Add more robust loading states to prevent premature rendering 