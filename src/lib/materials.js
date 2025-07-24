// Raw Materials CRUD and helpers for Supabase
import { supabase } from './supabase';
import { generateSlug } from './utils';

/**
 * Fetch all materials from the backend.
 * @returns {Promise<{data: Array, error: any}>}
 */
export const getAllMaterials = async () => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return { data: data.map(material => ({
      id: material.id,
      materialName: material.material_name,
      supplierName: material.supplier_name,
      manufacture: material.manufacture,
      tradeName: material.trade_name,
      supplierCost: material.supplier_cost,
      casNumber: material.cas_number,
      weightVolume: material.weight_volume,
      activityPercentage: material.activity_percentage,
      density: material.density,
      viscosity: material.viscosity,
      cost: material.cost,
      country: material.country,
      description: material.description,
      physicalForm: material.physical_form,
      purity: material.purity,
      storageConditions: material.storage_conditions,
      hazardClass: material.hazard_class,
      shelfLife: material.shelf_life,
      created_by: material.created_by,
      assigned_to: material.assigned_to,
      created_at: material.created_at,
      updated_at: material.updated_at,
      dataSourceNotes: material.data_source_notes,
      confidenceLevel: material.confidence_level,
      verificationSources: material.verification_sources,
      lastVerified: material.last_verified,
      molecularFormula: material.molecular_formula,
      molecularWeight: material.molecular_weight,
      iupacName: material.iupac_name,
      pubchemCID: material.pubchem_cid,
      canonicalSMILES: material.canonical_smiles
    })), error: null };
  } catch (error) {
    console.error('Error fetching materials:', error);
    return { data: [], error };
  }
};

/**
 * Fetch a single material by ID.
 * @param {string|number} id - Material ID
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const getMaterialById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('raw_materials')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      activityPercentage: data.activity_percentage,
      density: data.density,
      viscosity: data.viscosity,
      cost: data.cost,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      dataSourceNotes: data.data_source_notes,
      confidenceLevel: data.confidence_level,
      verificationSources: data.verification_sources,
      lastVerified: data.last_verified,
      molecularFormula: data.molecular_formula,
      molecularWeight: data.molecular_weight,
      iupacName: data.iupac_name,
      pubchemCID: data.pubchem_cid,
      canonicalSMILES: data.canonical_smiles
    }, error: null };
  } catch (error) {
    console.error('Error fetching material:', error);
    return { data: null, error };
  }
};

/**
 * Add a new material.
 * @param {Object} materialData - Material data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const addMaterial = async (materialData) => {
  try {
    const dbData = {
      id: materialData.id || generateSlug(materialData.materialName),
      material_name: materialData.materialName,
      supplier_name: materialData.supplierName,
      manufacture: materialData.manufacture,
      trade_name: materialData.tradeName,
      supplier_cost: materialData.supplierCost,
      cas_number: materialData.casNumber,
      weight_volume: materialData.weightVolume,
      activity_percentage: materialData.activityPercentage,
      density: materialData.density,
      viscosity: materialData.viscosity,
      cost: materialData.cost,
      country: materialData.country,
      description: materialData.description,
      physical_form: materialData.physicalForm,
      purity: materialData.purity,
      storage_conditions: materialData.storageConditions,
      hazard_class: materialData.hazardClass,
      shelf_life: materialData.shelfLife,
      created_by: materialData.created_by,
      assigned_to: materialData.assigned_to,
      data_source_notes: materialData.dataSourceNotes,
      confidence_level: materialData.confidenceLevel,
      verification_sources: materialData.verificationSources,
      last_verified: materialData.lastVerified,
      molecular_formula: materialData.molecularFormula,
      molecular_weight: materialData.molecularWeight,
      iupac_name: materialData.iupacName,
      pubchem_cid: materialData.pubchemCID,
      canonical_smiles: materialData.canonicalSMILES
    };
    const { data, error } = await supabase
      .from('raw_materials')
      .insert([dbData])
      .select('*')
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      activityPercentage: data.activity_percentage,
      density: data.density,
      viscosity: data.viscosity,
      cost: data.cost,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      dataSourceNotes: data.data_source_notes,
      confidenceLevel: data.confidence_level,
      verificationSources: data.verification_sources,
      lastVerified: data.last_verified,
      molecularFormula: data.molecular_formula,
      molecularWeight: data.molecular_weight,
      iupacName: data.iupac_name,
      pubchemCID: data.pubchem_cid,
      canonicalSMILES: data.canonical_smiles
    }, error: null };
  } catch (error) {
    console.error('Error adding material:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing material.
 * @param {string|number} materialId - Material ID
 * @param {Object} updatedData - Updated material data
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const updateMaterial = async (materialId, updatedData) => {
  try {
    const dbData = {
      material_name: updatedData.materialName,
      supplier_name: updatedData.supplierName,
      manufacture: updatedData.manufacture,
      trade_name: updatedData.tradeName,
      supplier_cost: updatedData.supplierCost,
      cas_number: updatedData.casNumber,
      weight_volume: updatedData.weightVolume,
      activity_percentage: updatedData.activityPercentage,
      density: updatedData.density,
      viscosity: updatedData.viscosity,
      cost: updatedData.cost,
      country: updatedData.country,
      description: updatedData.description,
      physical_form: updatedData.physicalForm,
      purity: updatedData.purity,
      storage_conditions: updatedData.storageConditions,
      hazard_class: updatedData.hazardClass,
      shelf_life: updatedData.shelfLife,
      updated_at: new Date().toISOString(),
      assigned_to: updatedData.assigned_to,
      data_source_notes: updatedData.dataSourceNotes,
      confidence_level: updatedData.confidenceLevel,
      verification_sources: updatedData.verificationSources,
      last_verified: updatedData.lastVerified,
      molecular_formula: updatedData.molecularFormula,
      molecular_weight: updatedData.molecularWeight,
      iupac_name: updatedData.iupacName,
      pubchem_cid: updatedData.pubchemCID,
      canonical_smiles: updatedData.canonicalSMILES
    };
    const { data, error } = await supabase
      .from('raw_materials')
      .update(dbData)
      .eq('id', materialId)
      .select('*')
      .single();
    if (error) throw error;
    return { data: {
      id: data.id,
      materialName: data.material_name,
      supplierName: data.supplier_name,
      manufacture: data.manufacture,
      tradeName: data.trade_name,
      supplierCost: data.supplier_cost,
      casNumber: data.cas_number,
      weightVolume: data.weight_volume,
      activityPercentage: data.activity_percentage,
      density: data.density,
      viscosity: data.viscosity,
      cost: data.cost,
      country: data.country,
      description: data.description,
      physicalForm: data.physical_form,
      purity: data.purity,
      storageConditions: data.storage_conditions,
      hazardClass: data.hazard_class,
      shelfLife: data.shelf_life,
      created_by: data.created_by,
      assigned_to: data.assigned_to,
      created_at: data.created_at,
      updated_at: data.updated_at,
      dataSourceNotes: data.data_source_notes,
      confidenceLevel: data.confidence_level,
      verificationSources: data.verification_sources,
      lastVerified: data.last_verified,
      molecularFormula: data.molecular_formula,
      molecularWeight: data.molecular_weight,
      iupacName: data.iupac_name,
      pubchemCID: data.pubchem_cid,
      canonicalSMILES: data.canonical_smiles
    }, error: null };
  } catch (error) {
    console.error('Error updating material:', error);
    return { data: null, error };
  }
};

/**
 * Delete a material by ID.
 * @param {string|number} materialId - Material ID
 * @returns {Promise<{data: boolean, error: any}>}
 */
export const deleteMaterial = async (materialId) => {
  try {
    const { error } = await supabase
      .from('raw_materials')
      .delete()
      .eq('id', materialId);
    if (error) throw error;
    return { data: true, error: null };
  } catch (error) {
    console.error('Error deleting material:', error);
    return { data: false, error };
  }
}; 