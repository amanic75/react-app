// Formulas CRUD and helpers for Supabase
import { supabase } from './supabase';
import { generateSlug } from './utils';

/**
 * Fetch all formulas from the backend.
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getAllFormulas = async () => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    
    // Debug: Log the first formula to see actual database structure
    if (data && data.length > 0) {
      console.log('First formula from database:', data[0]);
    }
    
    return { data: data.map(formula => ({
      id: formula.id,
      name: formula.name || formula.formula_name, // Handle both schemas
      totalCost: formula.total_cost,
      finalSalePriceDrum: formula.final_sale_price_drum,
      finalSalePriceTote: formula.final_sale_price_tote,
      ingredients: formula.ingredients || [],
      created_by: formula.created_by,
      assigned_to: formula.assigned_to,
      created_at: formula.created_at,
      updated_at: formula.updated_at,
      createdByUser: null,
      assignedToUser: null
    })), error: null };
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return { data: [], error };
  }
};

/**
 * Fetch a single formula by ID.
 * @param {string|number} id - Formula ID
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const getFormulaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('formulas')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      name: data.name || data.formula_name, // Handle both schemas
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: null,
      assignedToUser: null
    }, error: null };
  } catch (error) {
    console.error('Error fetching formula by ID:', error);
    return { data: null, error };
  }
};

/**
 * Add a new formula.
 * @param {Object} formulaData - Formula data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const addFormula = async (formulaData) => {
  try {
    const dbData = {
      id: formulaData.id || generateSlug(formulaData.name),
      name: formulaData.name, // Use 'name' field for new schema
      total_cost: formulaData.totalCost,
      final_sale_price_drum: formulaData.finalSalePriceDrum,
      final_sale_price_tote: formulaData.finalSalePriceTote,
      ingredients: formulaData.ingredients || [],
      created_by: formulaData.created_by,
      assigned_to: formulaData.assigned_to || []
    };
    
    console.log('Adding formula with data:', dbData);
    
    const { data, error } = await supabase
      .from('formulas')
      .insert([dbData])
      .select('*')
      .single();
    if (error) throw error;
    
    console.log('Formula added successfully:', data);
    
    return { data: {
      id: data.id,
      name: data.name || data.formula_name, // Handle both schemas
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: null,
      assignedToUser: null
    }, error: null };
  } catch (error) {
    console.error('Error adding formula:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing formula.
 * @param {string|number} formulaId - Formula ID
 * @param {Object} updatedData - Updated formula data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const updateFormula = async (formulaId, updatedData) => {
  try {
    const dbData = {
      name: updatedData.name,
      total_cost: updatedData.totalCost,
      final_sale_price_drum: updatedData.finalSalePriceDrum,
      final_sale_price_tote: updatedData.finalSalePriceTote,
      ingredients: updatedData.ingredients,
      updated_at: new Date().toISOString(),
      assigned_to: updatedData.assigned_to || []
    };
    
    console.log('Updating formula with data:', dbData);
    
    const { data, error } = await supabase
      .from('formulas')
      .update(dbData)
      .eq('id', formulaId)
      .select('*')
      .single();
    if (error) throw error;
    
    console.log('Formula updated successfully:', data);
    
    return { data: {
      id: data.id,
      name: data.name || data.formula_name, // Handle both schemas
      totalCost: data.total_cost,
      finalSalePriceDrum: data.final_sale_price_drum,
      finalSalePriceTote: data.final_sale_price_tote,
      ingredients: data.ingredients || [],
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      createdByUser: null,
      assignedToUser: null
    }, error: null };
  } catch (error) {
    console.error('Error updating formula:', error);
    return { data: null, error };
  }
};

/**
 * Delete a formula by ID.
 * @param {string|number} formulaId - Formula ID
 * @returns {Promise<{data: boolean, error: any}>}
 */
export const deleteFormula = async (formulaId) => {
  try {
    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('id', formulaId);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    // console.error removed
    return { data: false, error };
  }
}; 