// Test script to check formula assignments
import { supabase } from './src/lib/supabase.js';

async function testAssignments() {
  console.log('Testing formula assignments...');
  
  try {
    // Get all formulas with their assignments
    const { data: formulas, error } = await supabase
      .from('formulas')
      .select('id, name, formula_name, created_by, assigned_to')
      .limit(10);
    
    if (error) {
      console.error('Error fetching formulas:', error);
      return;
    }
    
    console.log('Formulas with assignments:');
    formulas.forEach(formula => {
      console.log(`- ID: ${formula.id}`);
      console.log(`  Name: ${formula.name || formula.formula_name}`);
      console.log(`  Created by: ${formula.created_by}`);
      console.log(`  Assigned to: ${JSON.stringify(formula.assigned_to)}`);
      console.log('');
    });
    
    // Get some user profiles to test with
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, email, role, app_access')
      .limit(5);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }
    
    console.log('Users for testing:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  App Access: ${JSON.stringify(user.app_access)}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAssignments(); 