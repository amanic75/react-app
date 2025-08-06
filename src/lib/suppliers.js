// Suppliers CRUD and helpers for Supabase
import { supabase } from './supabase';

/**
 * Fetch all suppliers from the backend with company filtering to prevent data flashing.
 * @param {Object} options - Options including userProfile for filtering
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getAllSuppliers = async (options = {}) => {
  try {
    let query = supabase.from('suppliers').select('*');
    
    // Apply company filtering to prevent data flashing for non-NSight users
    if (options.userProfile) {
      if (options.userProfile.role === 'NSight Admin') {
        // NSight Admins see all suppliers
        query = query.order('id', { ascending: true });
      } else if (options.userProfile.company_id) {
        // Other users only see their company's suppliers
        query = query
          .eq('company_id', options.userProfile.company_id)
          .order('id', { ascending: true });
      } else {
        // No company_id = no access
        return { data: [], error: null };
      }
    } else {
      // Fallback to basic query (will rely on RLS)
      query = query.order('id', { ascending: true });
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: data.map(supplier => ({
      id: supplier.id,
      supplierName: supplier.supplier_name,
      supplierId: supplier.supplier_id,
      supplierEmail: supplier.supplier_email,
      supplierContact: supplier.supplier_contact,
      packagingCode: supplier.packaging_code,
      standardCost: supplier.standard_cost,
      created_by: supplier.created_by,
      assigned_to: supplier.assigned_to,
      created_at: supplier.created_at,
      updated_at: supplier.updated_at,
      createdByUser: supplier.created_by_profile ? `${supplier.created_by_profile.first_name} ${supplier.created_by_profile.last_name}` : null,
      assignedToUser: supplier.assigned_to_profile ? `${supplier.assigned_to_profile.first_name} ${supplier.assigned_to_profile.last_name}` : null
    })), error: null };
  } catch (error) {
    // console.error removed
    return { data: [], error };
  }
};

/**
 * Fetch a single supplier by ID.
 * @param {string|number} id - Supplier ID
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const getSupplierById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      supplierName: data.supplier_name,
      supplierId: data.supplier_id,
      supplierEmail: data.supplier_email,
      supplierContact: data.supplier_contact,
      packagingCode: data.packaging_code,
      standardCost: data.standard_cost,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Add a new supplier.
 * @param {Object} supplierData - Supplier data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const addSupplier = async (supplierData) => {
  try {
    const dbData = {
      supplier_name: supplierData.supplierName,
      supplier_id: supplierData.supplierId,
      supplier_email: supplierData.supplierEmail,
      supplier_contact: supplierData.supplierContact,
      packaging_code: supplierData.packagingCode,
      standard_cost: supplierData.standardCost,
      created_by: supplierData.created_by,
      assigned_to: supplierData.assigned_to
    };
    const { data, error } = await supabase
      .from('suppliers')
      .insert([dbData])
      .select('*')
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      supplierName: data.supplier_name,
      supplierId: data.supplier_id,
      supplierEmail: data.supplier_email,
      supplierContact: data.supplier_contact,
      packagingCode: data.packaging_code,
      standardCost: data.standard_cost,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Update an existing supplier.
 * @param {string|number} supplierId - Supplier ID
 * @param {Object} updatedData - Updated supplier data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const updateSupplier = async (supplierId, updatedData) => {
  try {
    const dbData = {
      supplier_name: updatedData.supplierName,
      supplier_id: updatedData.supplierId,
      supplier_email: updatedData.supplierEmail,
      supplier_contact: updatedData.supplierContact,
      packaging_code: updatedData.packagingCode,
      standard_cost: updatedData.standardCost,
      updated_at: new Date().toISOString(),
      assigned_to: updatedData.assigned_to
    };
    const { data, error } = await supabase
      .from('suppliers')
      .update(dbData)
      .eq('id', supplierId)
      .select('*')
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      supplierName: data.supplier_name,
      supplierId: data.supplier_id,
      supplierEmail: data.supplier_email,
      supplierContact: data.supplier_contact,
      packagingCode: data.packaging_code,
      standardCost: data.standard_cost,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: data.created_by_profile ? `${data.created_by_profile.first_name} ${data.created_by_profile.last_name}` : null,
      assignedToUser: data.assigned_to_profile ? `${data.assigned_to_profile.first_name} ${data.assigned_to_profile.last_name}` : null
    }, error: null };
  } catch (error) {
    // console.error removed
    return { data: null, error };
  }
};

/**
 * Delete a supplier by ID.
 * @param {string|number} supplierId - Supplier ID
 * @returns {Promise<{data: boolean, error: any}>}
 */
export const deleteSupplier = async (supplierId) => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    // console.error removed
    return { data: false, error };
  }
}; 