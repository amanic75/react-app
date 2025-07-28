// Comprehensive test to check current state
import { supabase } from './src/lib/supabase.js';

async function testCurrentState() {
  console.log('=== TESTING CURRENT STATE ===');
  
  try {
    // 1. Check formulas table structure
    console.log('\n1. Checking formulas table structure...');
    const { data: formulas, error } = await supabase
      .from('formulas')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('Error fetching formulas:', error);
      return;
    }
    
    console.log(`Found ${formulas.length} formulas`);
    if (formulas.length > 0) {
      console.log('Formula fields:', Object.keys(formulas[0]));
      console.log('Sample formula:', formulas[0]);
    }
    
    // 2. Check user profiles
    console.log('\n2. Checking user profiles...');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log(`Found ${users.length} users`);
    if (users.length > 0) {
      console.log('User fields:', Object.keys(users[0]));
      console.log('Sample user:', users[0]);
    }
    
    // 3. Test assignment filtering logic
    console.log('\n3. Testing assignment filtering...');
    if (users.length > 0 && formulas.length > 0) {
      const testUser = users[0];
      const testFormula = formulas[0];
      
      console.log('Test user:', { id: testUser.id, email: testUser.email, role: testUser.role, app_access: testUser.app_access });
      console.log('Test formula:', { id: testFormula.id, name: testFormula.name || testFormula.formula_name, created_by: testFormula.created_by, assigned_to: testFormula.assigned_to });
      
      // Test "created by me" filter
      const isCreatedByUser = testFormula.created_by === testUser.id;
      console.log(`Formula created by user: ${isCreatedByUser}`);
      
      // Test "assigned to me" filter
      const isAssignedToUser = testFormula.assigned_to && 
        (Array.isArray(testFormula.assigned_to) ? testFormula.assigned_to.includes(testUser.id) : testFormula.assigned_to === testUser.id);
      console.log(`Formula assigned to user: ${isAssignedToUser}`);
    }
    
    // 4. Check app access for employees
    console.log('\n4. Checking employee app access...');
    const employees = users.filter(u => u.role === 'Employee');
    console.log(`Found ${employees.length} employees`);
    employees.forEach(emp => {
      const hasFormulasAccess = emp.app_access && emp.app_access.includes('formulas');
      console.log(`- ${emp.email}: has formulas access = ${hasFormulasAccess}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCurrentState(); 