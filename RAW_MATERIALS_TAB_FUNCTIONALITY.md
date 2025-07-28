# Raw Materials Tab Functionality Implementation

## **Context & Previous Work**

We successfully implemented "Created by Me" and "Assigned to Me" tab functionality for the **Formulas** app. This document outlines what was accomplished and how to replicate it for the **Raw Materials** app.

## **What We Implemented (Formulas App)**

### **✅ Core Features:**
1. **Tab Navigation**: "All", "Assigned to me", "Created by Me" tabs
2. **Role-Based UI**: "Assigned to me" tab only shows for 'Employee' role
3. **Data Filtering**: `filterByTab()` function with role-based logic
4. **Assignment Modal**: Employee-only assignment with app access filtering
5. **Database Integration**: `created_by` and `assigned_to` fields

### **🔧 Key Technical Fixes:**
1. **Safe Initialization**: All formula fields have fallback values
2. **toFixed() Errors**: Safe numeric handling with `|| 0` fallbacks
3. **Save-Cancel Flow**: Proper handling of `updateFormula` return values
4. **Array Safety**: `Array.isArray()` checks for ingredients
5. **Employee Filtering**: Only show employees, not admins in assignment modal

## **Files Modified for Formulas:**

### **Core Components:**
- `src/pages/FormulasPage.jsx` - Main page with tab logic
- `src/pages/FormulaDetailPage.jsx` - Detail page with editing
- `src/components/shared/EmployeeAssignmentSelector.jsx` - Assignment modal
- `src/lib/filterUtils.js` - Tab filtering utilities
- `src/lib/formulas.js` - Database operations

### **Key Changes:**
1. **FormulasPage.jsx**:
   - Conditional "Assigned to me" tab for employees only
   - `filterByTab()` with `userProfile` parameter
   - `created_by` population in `handleAddFormula`
   - Active tab reset logic

2. **FormulaDetailPage.jsx**:
   - Safe initialization in `handleEditToggle` and `handleCancel`
   - Fixed `toFixed()` calls with fallbacks
   - Proper `updateFormula` return value handling

3. **EmployeeAssignmentSelector.jsx**:
   - Filter to only show employees: `user.role === 'Employee'`
   - App access filtering for 'formulas' app

4. **filterUtils.js**:
   - Added `userProfile` parameter
   - Skip assignment filtering for 'Capacity Admin' role

5. **formulas.js**:
   - Handle both `name` and `formula_name` schemas
   - Safe `assigned_to` array handling

## **Task: Implement Same for Raw Materials**

### **🎯 Objective:**
Replicate the exact same tab functionality for the **Raw Materials** app.

### **📋 Required Changes:**

#### **1. Raw Materials Page (`src/pages/RawMaterialsPage.jsx`)**
- Add tab navigation: "All", "Assigned to me", "Created by Me"
- Conditional "Assigned to me" tab for employees only
- Implement `filterByTab()` with `userProfile`
- Add `created_by` to new material creation
- Add active tab reset logic

#### **2. Raw Material Detail Page (`src/pages/RawMaterialDetailPage.jsx`)**
- Add "Manage Assignments" button
- Integrate `EmployeeAssignmentSelector` component
- Implement assignment save logic
- Add safe initialization for all fields
- Fix any `toFixed()` errors

#### **3. Employee Assignment Selector**
- Update filtering to include 'raw_materials' app access
- Ensure only employees are shown (not admins)

#### **4. Filter Utils (`src/lib/filterUtils.js`)**
- Ensure `filterByTab()` works for raw materials data structure
- Test with raw materials specific fields

#### **5. Raw Materials Service (`src/lib/materials.js`)**
- Add `created_by` field to new material creation
- Handle `assigned_to` array properly
- Ensure database compatibility

### **🔍 Database Schema (Raw Materials):**
```sql
-- Expected fields in raw_materials table:
- id (UUID)
- material_name (text)
- supplier_name (text)
- supplier_cost (numeric)
- cas_number (text)
- created_by (UUID) -- Add if missing
- assigned_to (UUID[]) -- Add if missing
- created_at (timestamp)
- updated_at (timestamp)
```

### **🧪 Testing Checklist:**
1. **Tab Functionality**:
   - [ ] "All" tab shows all materials
   - [ ] "Assigned to me" tab only shows for employees
   - [ ] "Created by Me" tab shows user's created materials
   - [ ] Tab switching works without errors

2. **Assignment Modal**:
   - [ ] Only employees shown (no admins)
   - [ ] Only employees with 'raw_materials' access
   - [ ] Assignment saves correctly
   - [ ] Assigned materials appear in "Assigned to me" tab

3. **Data Safety**:
   - [ ] No `toFixed()` errors
   - [ ] Safe initialization of all fields
   - [ ] Proper save-cancel flow
   - [ ] Array safety for any arrays

4. **Role-Based Access**:
   - [ ] Capacity Admins don't see "Assigned to me" tab
   - [ ] Employees see "Assigned to me" tab
   - [ ] Assignment modal filters correctly

### **🚀 Implementation Steps:**

1. **Start with RawMaterialsPage.jsx** - Add tab navigation and filtering
2. **Update materials.js** - Add `created_by` to new material creation
3. **Modify RawMaterialDetailPage.jsx** - Add assignment functionality
4. **Test EmployeeAssignmentSelector** - Ensure it works with raw materials
5. **Verify filterUtils.js** - Test with raw materials data
6. **Database Check** - Ensure `created_by` and `assigned_to` fields exist
7. **Comprehensive Testing** - Test all scenarios

### **⚠️ Important Notes:**
- **Copy the exact patterns** from Formulas implementation
- **Test thoroughly** - Raw materials may have different data structures
- **Check database schema** - Ensure required fields exist
- **Maintain consistency** - Use same naming and patterns as Formulas

### **📁 Files to Focus On:**
1. `src/pages/RawMaterialsPage.jsx`
2. `src/pages/RawMaterialDetailPage.jsx`
3. `src/lib/materials.js`
4. `src/components/shared/EmployeeAssignmentSelector.jsx` (update filtering)
5. `src/lib/filterUtils.js` (verify compatibility)

### **🎯 Success Criteria:**
- Raw Materials page has same tab functionality as Formulas
- Assignment modal only shows employees with raw_materials access
- "Assigned to me" tab only appears for Employee role
- No console errors during any operations
- Data persists correctly after save/cancel operations

---

**Ready to implement! Follow the exact same patterns and fixes used for the Formulas app.** 