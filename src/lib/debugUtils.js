// Debug utilities for troubleshooting assigned_to filtering issues
import { supabase } from './supabase';

export const debugAssignedToFields = async () => {
  // console.log removed
  
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
    
    // console.log removed
    if (materials && materials.length > 0) {
      materials.forEach(material => {
        // Material assigned_to debug info
      });
    } else {
      // console.log removed
    }
    
    // console.log removed
    if (formulas && formulas.length > 0) {
      formulas.forEach(formula => {
        // Formula assigned_to debug info
      });
    } else {
      // console.log removed
    }
    
    // console.log removed
    if (suppliers && suppliers.length > 0) {
      suppliers.forEach(supplier => {
        // Supplier assigned_to debug info
      });
    } else {
      // console.log removed
    }
    
  } catch (error) {
    // console.error removed
  }
};

export const debugCurrentUser = async () => {
  // console.log removed
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      // console.error removed
      return null;
    }
    
    // Current user debug info
    
    return user;
  } catch (error) {
    // console.error removed
    return null;
  }
};

export const debugFilteringLogic = async (user) => {
  // console.log removed
  
  if (!user) {
    // console.log removed
    return;
  }
  
  try {
    // Test with a few materials
    const { data: materials, error } = await supabase
      .from('raw_materials')
      .select('id, material_name, assigned_to')
      .limit(3);
    
    if (error) {
      // console.error removed
      return;
    }
    
    // console.log removed
    materials.forEach(material => {
      const isAssigned = checkAssignment(material.assigned_to, user.id);
      // Material filtering debug info
    });
    
  } catch (error) {
    // console.error removed
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
  // console.log removed
  // console.log removed
  
  await debugAssignedToFields();
  // console.log removed
  
  const user = await debugCurrentUser();
  // console.log removed
  
  if (user) {
    await debugFilteringLogic(user);
  }
  
  // console.log removed
  // console.log removed
}; 