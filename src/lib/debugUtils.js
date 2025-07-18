// Debug utilities for troubleshooting assigned_to filtering issues
import { supabase } from './supabase';

export const debugAssignedToFields = async () => {
  console.log('🔍 Debug: Checking assigned_to field structure in database...');
  
  try {
    // Check raw_materials table
    const { data: materials, error: materialsError } = await supabase
      .from('raw_materials')
      .select('id, material_name, assigned_to')
      .limit(5);
    
    // Check formulas table  
    const { data: formulas, error: formulasError } = await supabase
      .from('formulas')
      .select('id, name, assigned_to')
      .limit(5);
    
    // Check suppliers table
    const { data: suppliers, error: suppliersError } = await supabase
      .from('suppliers')
      .select('id, supplier_name, assigned_to')
      .limit(5);
    
    console.log('📊 Raw Materials assigned_to field analysis:');
    if (materials && materials.length > 0) {
      materials.forEach(material => {
        console.log(`  - ${material.material_name}: assigned_to =`, {
          value: material.assigned_to,
          type: typeof material.assigned_to,
          isArray: Array.isArray(material.assigned_to),
          length: material.assigned_to ? material.assigned_to.length : 'N/A'
        });
      });
    } else {
      console.log('  - No materials found or error:', materialsError);
    }
    
    console.log('📊 Formulas assigned_to field analysis:');
    if (formulas && formulas.length > 0) {
      formulas.forEach(formula => {
        console.log(`  - ${formula.name}: assigned_to =`, {
          value: formula.assigned_to,
          type: typeof formula.assigned_to,
          isArray: Array.isArray(formula.assigned_to),
          length: formula.assigned_to ? formula.assigned_to.length : 'N/A'
        });
      });
    } else {
      console.log('  - No formulas found or error:', formulasError);
    }
    
    console.log('📊 Suppliers assigned_to field analysis:');
    if (suppliers && suppliers.length > 0) {
      suppliers.forEach(supplier => {
        console.log(`  - ${supplier.supplier_name}: assigned_to =`, {
          value: supplier.assigned_to,
          type: typeof supplier.assigned_to,
          isArray: Array.isArray(supplier.assigned_to),
          length: supplier.assigned_to ? supplier.assigned_to.length : 'N/A'
        });
      });
    } else {
      console.log('  - No suppliers found or error:', suppliersError);
    }
    
  } catch (error) {
    console.error('❌ Error debugging assigned_to fields:', error);
  }
};

export const debugCurrentUser = async () => {
  console.log('🔍 Debug: Checking current user information...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
    
    console.log('👤 Current user debug info:', {
      id: user?.id,
      email: user?.email,
      id_type: typeof user?.id,
      id_length: user?.id ? user.id.length : 'N/A'
    });
    
    return user;
  } catch (error) {
    console.error('❌ Error debugging current user:', error);
    return null;
  }
};

export const debugFilteringLogic = async (user) => {
  console.log('🔍 Debug: Testing filtering logic with current user...');
  
  if (!user) {
    console.log('⚠️ No user provided for filtering test');
    return;
  }
  
  try {
    // Test with a few materials
    const { data: materials, error } = await supabase
      .from('raw_materials')
      .select('id, material_name, assigned_to')
      .limit(3);
    
    if (error) {
      console.error('❌ Error fetching materials for filtering test:', error);
      return;
    }
    
    console.log('🧪 Filtering test results:');
    materials.forEach(material => {
      const isAssigned = checkAssignment(material.assigned_to, user.id);
      console.log(`  - ${material.material_name}:`, {
        assigned_to: material.assigned_to,
        user_id: user.id,
        isAssigned: isAssigned,
        reason: getAssignmentReason(material.assigned_to, user.id)
      });
    });
    
  } catch (error) {
    console.error('❌ Error testing filtering logic:', error);
  }
};

// Helper function to check assignment (supports both UUID and UUID[] formats)
const checkAssignment = (assignedTo, userId) => {
  if (!assignedTo || !userId) return false;
  
  // Handle array format (UUID[])
  if (Array.isArray(assignedTo)) {
    return assignedTo.includes(userId);
  }
  
  // Handle string format (single UUID)
  if (typeof assignedTo === 'string') {
    return assignedTo === userId;
  }
  
  return false;
};

// Helper function to explain why assignment check passed/failed
const getAssignmentReason = (assignedTo, userId) => {
  if (!assignedTo) return 'assigned_to is null/undefined';
  if (!userId) return 'user_id is null/undefined';
  
  if (Array.isArray(assignedTo)) {
    if (assignedTo.length === 0) return 'assigned_to is empty array';
    if (assignedTo.includes(userId)) return 'user_id found in assigned_to array';
    return `user_id not in assigned_to array (has ${assignedTo.length} items)`;
  }
  
  if (typeof assignedTo === 'string') {
    if (assignedTo === userId) return 'assigned_to matches user_id (single UUID)';
    return 'assigned_to does not match user_id (single UUID)';
  }
  
  return `assigned_to has unexpected type: ${typeof assignedTo}`;
};

// Run comprehensive debug
export const runComprehensiveDebug = async () => {
  console.log('🚀 Starting comprehensive assigned_to debugging...');
  console.log('='.repeat(60));
  
  await debugAssignedToFields();
  console.log('='.repeat(60));
  
  const user = await debugCurrentUser();
  console.log('='.repeat(60));
  
  if (user) {
    await debugFilteringLogic(user);
  }
  
  console.log('='.repeat(60));
  console.log('✅ Debug complete! Check console output above for details.');
}; 