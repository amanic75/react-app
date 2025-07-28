# Formulas Assignment Testing Guide

## **Current Implementation Status**

### **✅ Fixed Issues:**
1. **Formula Creation**: New formulas now include `created_by` field
2. **Employee Assignment**: Assignment modal now filters by app access
3. **Database Compatibility**: Code handles both `name` and `formula_name` fields
4. **Debug Logging**: Added comprehensive logging for troubleshooting
5. **Role-Based Tabs**: "Assigned to me" tab only shows for Employees, not Capacity Admins
6. **Ingredients Array Safety**: Fixed error when `formula.ingredients` is not an array

### **🔍 Testing Steps:**

#### **1. Test Formula Creation**
1. Log in as any user
2. Go to Formulas page
3. Click "Add Formula"
4. Create a new formula
5. Check browser console for logs showing `created_by` field being set

#### **2. Test Assignment Modal**
1. Go to a formula detail page
2. Click "Edit Formula" (if Capacity Admin)
3. Click "Manage Assignments"
4. Verify only employees with formulas app access are shown
5. Assign formula to an employee
6. Save changes

#### **3. Test Tab Filtering by Role**

**For Capacity Admins:**
- **All**: Shows all formulas
- **Created by me**: Shows only formulas where `created_by` matches current user
- **Assigned to me**: Tab should NOT be visible

**For Employees:**
- **All**: Shows all formulas
- **Created by me**: Shows only formulas where `created_by` matches current user  
- **Assigned to me**: Shows only formulas where current user ID is in `assigned_to` array

#### **4. Debug Console Logs**
Check browser console for these logs:
- `filterByTab called with:` - Shows filtering parameters and user role
- `Capacity Admin - showing all formulas in assigned tab` - Shows admin behavior
- `Item X: assigned_to=Y, isAssigned=Z` - Shows assignment checks
- `Item X: created_by=Y, isCreated=Z` - Shows creation checks
- `FormulasPage filtering:` - Shows overall filtering stats and available tabs

#### **5. Database Verification**
Run the test scripts to verify database state:
```bash
node test-current-state.js
node test-assignments.js
node test-tab-filtering.js
```

## **Expected Behavior:**

### **Assignment Workflow:**
1. Capacity Admin edits formula
2. Clicks "Manage Assignments"
3. Sees only employees with formulas app access
4. Selects employees to assign
5. Saves assignment
6. Assigned employees see formula in "Assigned to me" tab

### **Tab Filtering by Role:**

**Capacity Admins:**
- **All**: Shows all formulas
- **Created by me**: Shows formulas where `created_by` = current user ID
- **Assigned to me**: Tab not visible (since admins have access to all)

**Employees:**
- **All**: Shows all formulas user has access to
- **Created by me**: Shows formulas where `created_by` = current user ID
- **Assigned to me**: Shows formulas where current user ID is in `assigned_to` array

## **Common Issues to Check:**

1. **User Object**: Verify `user` object is available and has correct `id`
2. **User Role**: Verify `userProfile.role` is correctly set
3. **Database Schema**: Check if using `name` or `formula_name` field
4. **App Access**: Verify employees have `'formulas'` in their `app_access` array
5. **Assignment Format**: Verify `assigned_to` is stored as UUID array

## **Next Steps:**
1. Test with real users and data
2. Verify assignment persistence
3. Test edge cases (empty assignments, multiple assignments)
4. Apply same fixes to Raw Materials if formulas work correctly 