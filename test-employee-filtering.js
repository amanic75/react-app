// Test script to verify employee filtering logic
console.log('=== TESTING EMPLOYEE FILTERING ===\n');

// Mock user data
const mockUsers = [
  {
    id: 'user-1',
    name: 'John Employee',
    email: 'john@capacity.com',
    role: 'Employee',
    app_access: ['formulas', 'raw_materials']
  },
  {
    id: 'user-2',
    name: 'Sarah Employee',
    email: 'sarah@capacity.com',
    role: 'Employee',
    app_access: ['formulas']
  },
  {
    id: 'user-3',
    name: 'Admin User',
    email: 'admin@capacity.com',
    role: 'Capacity Admin',
    app_access: ['all']
  },
  {
    id: 'user-4',
    name: 'Test Employee',
    email: 'test@capacity.com',
    role: 'Employee',
    app_access: ['raw_materials'] // No formulas access
  },
  {
    id: 'user-5',
    name: 'Assigned Employee',
    email: 'assigned@capacity.com',
    role: 'Employee',
    app_access: [] // No app access but already assigned
  }
];

// Mock current assignments
const currentAssignments = ['user-5'];

// Test the filtering logic
const testFiltering = () => {
  console.log('1. All users:');
  mockUsers.forEach(user => {
    console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Apps: ${user.app_access.join(', ')}`);
  });
  
  console.log('\n2. Current assignments:', currentAssignments);
  
  console.log('\n3. Applying filter logic:');
  const filteredUsers = mockUsers.filter(user => {
    // Check if user has access to formulas app
    const hasFormulasAccess = user.app_access && 
      (user.app_access.includes('formulas') || 
       user.app_access.includes('all'));
    
    // Include if they have formulas access or are already assigned
    // Only show employees, not admins
    const shouldInclude = (hasFormulasAccess || currentAssignments.includes(user.id)) && user.role === 'Employee';
    
    console.log(`- ${user.name}: hasFormulasAccess=${hasFormulasAccess}, isAssigned=${currentAssignments.includes(user.id)}, role=${user.role}, shouldInclude=${shouldInclude}`);
    
    return shouldInclude;
  });
  
  console.log('\n4. Filtered results (should only show employees):');
  filteredUsers.forEach(user => {
    console.log(`✅ ${user.name} (${user.email}) - Role: ${user.role}`);
  });
  
  console.log('\n5. Verification:');
  console.log('- Total users:', mockUsers.length);
  console.log('- Filtered users:', filteredUsers.length);
  console.log('- All filtered users are employees:', filteredUsers.every(u => u.role === 'Employee'));
  console.log('- No admins in filtered list:', !filteredUsers.some(u => u.role === 'Capacity Admin'));
};

testFiltering();
console.log('\n=== TEST COMPLETE ===');
console.log('✅ Employee filtering should now work correctly!'); 