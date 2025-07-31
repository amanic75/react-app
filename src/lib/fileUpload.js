import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage and save metadata to database
 * @param {File} file - File object to upload
 * @param {string} formulaId - Formula ID to associate with
 * @param {string} companyId - Company ID for organization
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const uploadFormulaFile = async (file, formulaId, companyId) => {
  try {
    // File validation
    const maxFileSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif'
    ];

    // Check file size
    if (file.size > maxFileSize) {
      return { 
        data: null, 
        error: { message: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` }
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { 
        data: null, 
        error: { message: `File type not allowed. Allowed types: PDF, DOC, DOCX, TXT, CSV, XLS, XLSX, PNG, JPG, GIF` }
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileName = `${formulaId}/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('formula-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return { data: null, error: uploadError };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('formula-documents')
      .getPublicUrl(fileName);

    // Save metadata to database
    const { data: dbData, error: dbError } = await supabase
      .from('formula_documents')
      .insert({
        formula_id: formulaId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: fileName,
        company_id: companyId
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // If database insert fails, delete the uploaded file
      await supabase.storage
        .from('formula-documents')
        .remove([fileName]);
      return { data: null, error: dbError };
    }

    return {
      data: {
        ...dbData,
        public_url: urlData.publicUrl
      },
      error: null
    };
  } catch (error) {
    console.error('File upload error:', error);
    return { data: null, error };
  }
};

/**
 * Get all documents for a formula
 * @param {string} formulaId - Formula ID
 * @returns {Promise<{data: Array|null, error: any}>}
 */
export const getFormulaDocuments = async (formulaId) => {
  try {
    // Get current user's company to ensure they only see their company's files
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return { data: null, error: userError };
    }

    const { data, error } = await supabase
      .from('formula_documents')
      .select('*')
      .eq('formula_id', formulaId)
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching formula documents:', error);
      return { data: null, error };
    }

    // Add public URLs to each document
    const documentsWithUrls = data.map(doc => ({
      ...doc,
      public_url: supabase.storage
        .from('formula-documents')
        .getPublicUrl(doc.storage_path).data.publicUrl
    }));

    return { data: documentsWithUrls, error: null };
  } catch (error) {
    console.error('Error in getFormulaDocuments:', error);
    return { data: null, error };
  }
};

/**
 * Delete a formula document (soft delete)
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export const deleteFormulaDocument = async (documentId) => {
  try {
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return { data: null, error: userError };
    }

    // Simple soft delete - let the RLS policies handle security
    const { data, error } = await supabase
      .from('formula_documents')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userData.user.id
      })
      .eq('id', documentId)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      console.error('Error deleting formula document:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in deleteFormulaDocument:', error);
    return { data: null, error };
  }
};

/**
 * Download a file from Supabase Storage
 * @param {string} storagePath - Storage path of the file
 * @param {string} fileName - Original file name
 * @returns {Promise<{data: Blob|null, error: any}>}
 */
export const downloadFormulaFile = async (storagePath, fileName) => {
  try {
    const { data, error } = await supabase.storage
      .from('formula-documents')
      .download(storagePath);

    if (error) {
      console.error('Error downloading file:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in downloadFormulaFile:', error);
    return { data: null, error };
  }
}; 