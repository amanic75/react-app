// Test script to verify tab filtering behavior
import { filterByTab } from './src/lib/filterUtils.js';

// Mock data for testing
const mockFormulas = [
  {
    id: 1,
    name: 'Formula 1',
    created_by: 'user-1',
    assigned_to: ['user-2', 'user-3']
  },
  {
    id: 2,
    name: 'Formula 2',
    created_by: 'user-2',
    assigned_to: ['user-1']
  },
  {
    id: 3,
    name: 'Formula 3',
    created_by: 'user-1',
    assigned_to: []
  }
];

const mockUser = { id: 'user-1', email: 'user1@test.com' };

// Test different scenarios
console.log('=== TESTING TAB FILTERING ===\n');

// Test 1: Employee user
console.log('1. Testing Employee user:');
const employeeProfile = { role: 'Employee' };
const employeeAll = filterByTab(mockFormulas, 'all', mockUser, employeeProfile);
const employeeAssigned = filterByTab(mockFormulas, 'assigned', mockUser, employeeProfile);
const employeeCreated = filterByTab(mockFormulas, 'created', mockUser, employeeProfile);

console.log(`- All tab: ${employeeAll.length} formulas`);
console.log(`- Assigned tab: ${employeeAssigned.length} formulas`);
console.log(`- Created tab: ${employeeCreated.length} formulas`);

// Test 2: Capacity Admin user
console.log('\n2. Testing Capacity Admin user:');
const adminProfile = { role: 'Capacity Admin' };
const adminAll = filterByTab(mockFormulas, 'all', mockUser, adminProfile);
const adminAssigned = filterByTab(mockFormulas, 'assigned', mockUser, adminProfile);
const adminCreated = filterByTab(mockFormulas, 'created', mockUser, adminProfile);

console.log(`- All tab: ${adminAll.length} formulas`);
console.log(`- Assigned tab: ${adminAssigned.length} formulas (should show all for admin)`);
console.log(`- Created tab: ${adminCreated.length} formulas`);

console.log('\n=== TEST COMPLETE ==='); 