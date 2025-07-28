// Test script to check database structure and formulas data
import { supabase } from './src/lib/supabase.js';

async function testDatabase() {
  console.log('Testing database structure...');
  
  try {
    // Check formulas table structure
    const { data: formulas, error } = await supabase
      .from('formulas')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching formulas:', error);
      return;
    }
    
    console.log('Formulas found:', formulas.length);
    if (formulas.length > 0) {
      console.log('First formula structure:', Object.keys(formulas[0]));
      console.log('Sample formula data:', formulas[0]);
    }
    
    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return;
    }
    
    console.log('User profiles found:', profiles.length);
    if (profiles.length > 0) {
      console.log('Sample user profile:', profiles[0]);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDatabase(); 