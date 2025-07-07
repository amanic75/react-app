import { supabase } from './supabase';

// Helper function to get current user
const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// ==============================================
// RAW MATERIALS DATA MANAGEMENT
// ==============================================

export const getAllMaterials = async () => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    
    // Transform database format to match existing frontend format
    return data.map(material => ({
      id: material.id,
      materialName: material.material_name,
      supplierName: material.supplier_name,
      manufacture: material.manufacture,
      tradeName: material.trade_name,
      supplierCost: material.supplier_cost,
      casNumber: material.cas_number,
      weightVolume: material.weight_volume,
      density: material.density,
      country: material.country,
      description: material.description,
      physicalForm: material.physical_form,
      purity: material.purity,
      storageConditions: material.storage_conditions,
      hazardClass: material.hazard_class,
      shelfLife: material.shelf_life,
      // User tracking fields
      created_by: material.created_by,
      assigned_to: material.assigned_to,
      created_at: material.created_at,
      updated_at: material.updated_at,
      createdByUser: material.created_by_profile ? 
        `${material.created_by_profile.first_name} ${material.created_by_profile.last_name}` : null,
      assignedToUser: material.assigned_to_profile ? 
        `${material.assigned_to_profile.first_name} ${material.assigned_to_profile.last_name}` : null
    }));
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const getMaterialById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Transform to frontend format
    return {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      density: data.density,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error fetching material:', error);
    return null;
  }
};

export const updateMaterial = async (materialId, updatedData) => {
  try {
    const user = await getCurrentUser();
    
    // Transform frontend format to database format
    const dbData = {
      material_name: updatedData.materialName,
      supplier_name: updatedData.supplierName,
      manufacture: updatedData.manufacture,
      trade_name: updatedData.tradeName,
      supplier_cost: updatedData.supplierCost,
      cas_number: updatedData.casNumber,
      weight_volume: updatedData.weightVolume,
      density: updatedData.density,
      country: updatedData.country,
      description: updatedData.description,
      physical_form: updatedData.physicalForm,
      purity: updatedData.purity,
      storage_conditions: updatedData.storageConditions,
      hazard_class: updatedData.hazardClass,
      shelf_life: updatedData.shelfLife,
      updated_at: new Date().toISOString()
    };

    // Include assigned_to if provided
    if (updatedData.assigned_to !== undefined) {
      dbData.assigned_to = updatedData.assigned_to;
    }

    const { data, error } = await supabase
      .from('raw_materials')
      .update(dbData)
      .eq('id', materialId)
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    // Transform back to frontend format
    return {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      density: data.density,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error updating material:', error);
    return null;
  }
};

export const addMaterial = async (materialData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    // Transform frontend format to database format
    const dbData = {
      material_name: materialData.materialName,
      supplier_name: materialData.supplierName,
      manufacture: materialData.manufacture,
      trade_name: materialData.tradeName,
      supplier_cost: materialData.supplierCost,
      cas_number: materialData.casNumber,
      weight_volume: materialData.weightVolume,
      density: materialData.density,
      country: materialData.country,
      description: materialData.description,
      physical_form: materialData.physicalForm,
      purity: materialData.purity,
      storage_conditions: materialData.storageConditions,
      hazard_class: materialData.hazardClass,
      shelf_life: materialData.shelfLife,
      created_by: user.id,
      assigned_to: materialData.assigned_to || user.id // Assign to creator by default
    };

    const { data, error } = await supabase
      .from('raw_materials')
      .insert([dbData])
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    // Transform back to frontend format
    return {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      density: data.density,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error adding material:', error);
    return null;
  }
};

// ==============================================
// FORMULAS DATA MANAGEMENT
// ==============================================

export const getAllFormulas = async () => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    
    // Transform database format to match existing frontend format
    return data.map(formula => ({
      id: formula.id,
      name: formula.name,
      totalCost: formula.total_cost,
      finalSalePriceDrum: formula.final_sale_price_drum,
      finalSalePriceTote: formula.final_sale_price_tote,
      ingredients: formula.ingredients || [],
      // User tracking fields
      created_by: formula.created_by,
      assigned_to: formula.assigned_to,
      created_at: formula.created_at,
      updated_at: formula.updated_at,
      createdByUser: formula.created_by_profile ? 
        `${formula.created_by_profile.first_name} ${formula.created_by_profile.last_name}` : null,
      assignedToUser: formula.assigned_to_profile ? 
        `${formula.assigned_to_profile.first_name} ${formula.assigned_to_profile.last_name}` : null
    }));
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return [];
  }
};

export const getFormulaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error fetching formula:', error);
    return null;
  }
};

export const updateFormula = async (formulaId, updatedData) => {
  try {
    const user = await getCurrentUser();
    
    const dbData = {
      name: updatedData.name,
      total_cost: updatedData.totalCost,
      final_sale_price_drum: updatedData.finalSalePriceDrum,
      final_sale_price_tote: updatedData.finalSalePriceTote,
      ingredients: updatedData.ingredients,
      updated_at: new Date().toISOString()
    };

    // Include assigned_to if provided
    if (updatedData.assigned_to !== undefined) {
      dbData.assigned_to = updatedData.assigned_to;
    }

    const { data, error } = await supabase
      .from('formulas')
      .update(dbData)
      .eq('id', formulaId)
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error updating formula:', error);
    return null;
  }
};

export const addFormula = async (formulaData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const dbData = {
      id: formulaData.id || `FORM${Date.now()}`,
      name: formulaData.name,
      total_cost: formulaData.totalCost,
      final_sale_price_drum: formulaData.finalSalePriceDrum,
      final_sale_price_tote: formulaData.finalSalePriceTote,
      ingredients: formulaData.ingredients || [],
      created_by: user.id,
      assigned_to: formulaData.assigned_to || user.id // Assign to creator by default
    };

    const { data, error } = await supabase
      .from('formulas')
      .insert([dbData])
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error adding formula:', error);
    return null;
  }
};

// ==============================================
// SUPPLIERS DATA MANAGEMENT
// ==============================================

export const getAllSuppliers = async () => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    
    return data.map(supplier => ({
      id: supplier.id,
      supplierName: supplier.supplier_name,
      supplierId: supplier.supplier_id,
      supplierEmail: supplier.supplier_email,
      supplierContact: supplier.supplier_contact,
      packagingCode: supplier.packaging_code,
      standardCost: supplier.standard_cost,
      // User tracking fields
      created_by: supplier.created_by,
      assigned_to: supplier.assigned_to,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
      createdByUser: supplier.created_by_profile ? 
        `${supplier.created_by_profile.first_name} ${supplier.created_by_profile.last_name}` : null,
      assignedToUser: supplier.assigned_to_profile ? 
        `${supplier.assigned_to_profile.first_name} ${supplier.assigned_to_profile.last_name}` : null
    }));
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  }
};

export const addSupplier = async (supplierData) => {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    
    const dbData = {
      supplier_name: supplierData.supplierName,
      supplier_id: supplierData.supplierId,
      supplier_email: supplierData.supplierEmail,
      supplier_contact: supplierData.supplierContact,
      packaging_code: supplierData.packagingCode,
      standard_cost: supplierData.standardCost,
      created_by: user.id,
      assigned_to: supplierData.assigned_to || user.id // Assign to creator by default
    };

    const { data, error } = await supabase
      .from('suppliers')
      .insert([dbData])
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      supplierName: data.supplier_name,
      supplierId: data.supplier_id,
      supplierEmail: data.supplier_email,
      supplierContact: data.supplier_contact,
      packagingCode: data.packaging_code,
      standardCost: data.standard_cost,
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error adding supplier:', error);
    return null;
  }
};

export const updateSupplier = async (supplierId, updatedData) => {
  try {
    const user = await getCurrentUser();
    
    const dbData = {
      supplier_name: updatedData.supplierName,
      supplier_id: updatedData.supplierId,
      supplier_email: updatedData.supplierEmail,
      supplier_contact: updatedData.supplierContact,
      packaging_code: updatedData.packagingCode,
      standard_cost: updatedData.standardCost,
      updated_at: new Date().toISOString()
    };

    // Include assigned_to if provided
    if (updatedData.assigned_to !== undefined) {
      dbData.assigned_to = updatedData.assigned_to;
    }

    const { data, error } = await supabase
      .from('suppliers')
      .update(dbData)
      .eq('id', supplierId)
      .select(`
        *,
        created_by_profile:user_profiles!created_by(first_name, last_name, email),
        assigned_to_profile:user_profiles!assigned_to(first_name, last_name, email)
      `)
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      supplierName: data.supplier_name,
      supplierId: data.supplier_id,
      supplierEmail: data.supplier_email,
      supplierContact: data.supplier_contact,
      packagingCode: data.packaging_code,
      standardCost: data.standard_cost,
      // User tracking fields
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? 
        `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? 
        `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    };
  } catch (error) {
    console.error('Error updating supplier:', error);
    return null;
  }
};

// ==============================================
// USERS DATA MANAGEMENT
// ==============================================

export const getAllUsers = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.last_login,
      contact: user.contact,
      appAccess: user.app_access || [],
      credentials: user.credentials
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const addUser = async (userData) => {
  try {
    const dbData = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
      last_login: userData.lastLogin,
      contact: userData.contact,
      app_access: userData.appAccess || [],
      credentials: userData.credentials
    };

    const { data, error } = await supabase
      .from('users')
      .insert([dbData])
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      contact: data.contact,
      appAccess: data.app_access || [],
      credentials: data.credentials
    };
  } catch (error) {
    console.error('Error adding user:', error);
    return null;
  }
};

export const updateUser = async (userId, updatedData) => {
  try {
    const dbData = {
      name: updatedData.name,
      email: updatedData.email,
      role: updatedData.role,
      status: updatedData.status,
      last_login: updatedData.lastLogin,
      contact: updatedData.contact,
      app_access: updatedData.appAccess || [],
      credentials: updatedData.credentials,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('users')
      .update(dbData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      lastLogin: data.last_login,
      contact: data.contact,
      appAccess: data.app_access || [],
      credentials: data.credentials
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const deleteFormula = async (formulaId) => {
  try {
    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('id', formulaId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting formula:', error);
    return false;
  }
};

export const deleteMaterial = async (materialId) => {
  try {
    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', materialId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting material:', error);
    return false;
  }
};

export const deleteSupplier = async (supplierId) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return false;
  }
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

export const generateMaterialId = (materialName) => {
  // Keep the same ID generation logic as before
  return materialName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}; 