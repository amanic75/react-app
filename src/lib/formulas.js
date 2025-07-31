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
    
    
    
    const { data, error } = await supabase
      .from('formulas')
      .insert([dbData])
      .select('*')
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
    
    
    
    const { data, error } = await supabase
      .from('formulas')
      .update(dbData)
      .eq('id', formulaId)
      .select('*')
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

/**
 * Duplicate a formula by ID.
 * @param {string|number} formulaId - Formula ID to duplicate
 * @param {string} userId - User ID creating the duplicate
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const duplicateFormula = async (formulaId, userId) => {
  try {
    // First, get the original formula
    const { data: originalFormula, error: fetchError } = await getFormulaById(formulaId);
    if (fetchError || !originalFormula) {
      throw new Error('Failed to fetch original formula');
    }

    // Create new formula data with copy suffix
    const newFormulaData = {
      name: `${originalFormula.name} (Copy)`,
      totalCost: originalFormula.totalCost,
      finalSalePriceDrum: originalFormula.finalSalePriceDrum,
      finalSalePriceTote: originalFormula.finalSalePriceTote,
      ingredients: [...originalFormula.ingredients], // Deep copy ingredients
      created_by: userId,
      assigned_to: [] // Reset assignments for the copy
    };

    // Add the new formula
    const { data: newFormula, error: addError } = await addFormula(newFormulaData);
    if (addError) throw addError;

    return { data: newFormula, error: null };
  } catch (error) {
    console.error('Error duplicating formula:', error);
    return { data: null, error };
  }
};

/**
 * Export formula data in various formats.
 * @param {string|number} formulaId - Formula ID to export
 * @param {string} format - Export format ('csv', 'json', 'pdf')
 * @returns {Promise<{data: any, error: any}>}
 */
export const exportFormulaData = async (formulaId, format = 'json') => {
  try {
    // Get the formula data
    const { data: formula, error: fetchError } = await getFormulaById(formulaId);
    if (fetchError || !formula) {
      throw new Error('Failed to fetch formula data');
    }

    const exportData = {
      formula: {
        id: formula.id,
        name: formula.name,
        totalCost: formula.totalCost,
        finalSalePriceDrum: formula.finalSalePriceDrum,
        finalSalePriceTote: formula.finalSalePriceTote,
        ingredients: formula.ingredients,
        assigned_to: formula.assigned_to,
        created_at: formula.created_at,
        updated_at: formula.updated_at
      },
      metadata: {
        exportDate: new Date().toISOString(),
        exportFormat: format,
        version: '1.0'
      }
    };

    switch (format.toLowerCase()) {
      case 'json':
        return { 
          data: {
            content: JSON.stringify(exportData, null, 2),
            filename: `${formula.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.json`,
            mimeType: 'application/json'
          }, 
          error: null 
        };

      case 'csv':
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        return { 
          data: {
            content: csvContent,
            filename: `${formula.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.csv`,
            mimeType: 'text/csv'
          }, 
          error: null 
        };

      case 'pdf':
        // For now, return JSON data that can be converted to PDF on frontend
        return { 
          data: {
            content: exportData,
            filename: `${formula.name.replace(/[^a-zA-Z0-9]/g, '_')}_report.pdf`,
            mimeType: 'application/pdf'
          }, 
          error: null 
        };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error('Error exporting formula data:', error);
    return { data: null, error };
  }
};

/**
 * Generate a comprehensive AI-powered formula report.
 * @param {string|number} formulaId - Formula ID to generate report for
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const generateFormulaReport = async (formulaId) => {
  try {
    // Get the formula data
    const { data: formula, error: fetchError } = await getFormulaById(formulaId);
    
    if (fetchError || !formula) {
      throw new Error('Failed to fetch formula data');
    }

    // Calculate report metrics
    const totalCost = formula.totalCost || 0;
    const drumPrice = formula.finalSalePriceDrum || 0;
    const totePrice = formula.finalSalePriceTote || 0;

    // Create AI prompt for report generation
    const aiPrompt = `Generate a professional formula report for "${formula.name}". 

Formula Details:
- Total Cost: $${totalCost.toFixed(2)}
- Drum Price: $${drumPrice.toFixed(2)}
- Tote Price: $${totePrice.toFixed(2)}
- Number of Ingredients: ${formula.ingredients.length}

Ingredients:
${formula.ingredients.map((ing, index) => 
  `${index + 1}. ${ing.name} - ${ing.quantity} - $${(ing.cost || 0).toFixed(2)}`
).join('\n')}

Please create a professional, readable report that includes:
1. Executive Summary
2. Financial Analysis (profit margins, cost breakdown)
3. Ingredient Analysis
4. Recommendations
5. Risk Assessment

Format the report in a professional business document style.`;

    // For now, we'll return structured data that can be formatted into PDF/Word
    // In the future, this will call the AI service
    const reportData = {
      formulaInfo: {
        id: formula.id,
        name: formula.name,
        totalCost: totalCost,
        finalSalePriceDrum: drumPrice,
        finalSalePriceTote: totePrice,
        created_at: formula.created_at,
        updated_at: formula.updated_at
      },
      financialAnalysis: {
        drumProfitMargin: drumPrice > 0 ? ((drumPrice - totalCost) / drumPrice * 100).toFixed(2) : 0,
        toteProfitMargin: totePrice > 0 ? ((totePrice - totalCost) / totePrice * 100).toFixed(2) : 0,
        drumProfit: drumPrice - totalCost,
        toteProfit: totePrice - totalCost
      },
      ingredients: formula.ingredients.map(ingredient => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        cost: ingredient.cost || 0,
        percentage: totalCost > 0 ? ((ingredient.cost || 0) / totalCost * 100).toFixed(2) : 0
      })),
      summary: {
        totalIngredients: formula.ingredients.length,
        averageIngredientCost: totalCost > 0 ? (totalCost / formula.ingredients.length).toFixed(2) : 0,
        highestCostIngredient: formula.ingredients.reduce((max, ing) => 
          (ing.cost || 0) > (max.cost || 0) ? ing : max, { cost: 0 }
        )
      },
      aiPrompt: aiPrompt, // Store the AI prompt for future use
      metadata: {
        generatedAt: new Date().toISOString(),
        reportVersion: '2.0',
        reportType: 'AI-Generated'
      }
    };

    return { data: reportData, error: null };
  } catch (error) {
    console.error('Error generating formula report:', error);
    return { data: null, error };
  }
};

/**
 * Helper function to convert formula data to CSV format.
 * @param {Object} exportData - Formula export data
 * @returns {string} CSV content
 */
const convertToCSV = (exportData) => {
  const { formula } = exportData;
  
  // Create CSV headers
  const headers = [
    'Formula ID',
    'Formula Name', 
    'Total Cost',
    'Drum Price',
    'Tote Price',
    'Ingredients Count',
    'Created Date'
  ];

  // Create CSV row
  const row = [
    formula.id,
    `"${formula.name}"`,
    formula.totalCost,
    formula.finalSalePriceDrum,
    formula.finalSalePriceTote,
    formula.ingredients.length,
    formula.created_at
  ];

  // Create ingredients section
  const ingredientHeaders = ['Ingredient Name', 'Quantity', 'Cost', 'Percentage'];
  const ingredientRows = formula.ingredients.map(ing => [
    `"${ing.name}"`,
    ing.quantity,
    ing.cost || 0,
    formula.totalCost > 0 ? ((ing.cost || 0) / formula.totalCost * 100).toFixed(2) : 0
  ]);

  // Combine all CSV content
  const csvContent = [
    headers.join(','),
    row.join(','),
    '', // Empty line
    'Ingredients:',
    ingredientHeaders.join(','),
    ...ingredientRows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}; 