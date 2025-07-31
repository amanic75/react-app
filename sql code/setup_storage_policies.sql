-- Setup Storage Bucket Policies for formula-documents
-- Run this after creating the formula-documents bucket in Supabase Storage

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for inserting files (users can upload to their company's folder)
CREATE POLICY "Users can upload files to their company's formula documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formula-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM formulas 
      WHERE id IN (
        SELECT formula_id FROM formula_documents 
        WHERE company_id IN (
          SELECT company_id FROM company_users 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy for viewing files (users can view files from their company)
CREATE POLICY "Users can view files from their company's formula documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'formula-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM formulas 
      WHERE id IN (
        SELECT formula_id FROM formula_documents 
        WHERE company_id IN (
          SELECT company_id FROM company_users 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy for updating files (users can update files they uploaded)
CREATE POLICY "Users can update files they uploaded" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'formula-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM formulas 
      WHERE id IN (
        SELECT formula_id FROM formula_documents 
        WHERE uploaded_by = auth.uid() AND
        company_id IN (
          SELECT company_id FROM company_users 
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Policy for deleting files (users can delete files they uploaded)
CREATE POLICY "Users can delete files they uploaded" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'formula-documents' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM formulas 
      WHERE id IN (
        SELECT formula_id FROM formula_documents 
        WHERE uploaded_by = auth.uid() AND
        company_id IN (
          SELECT company_id FROM company_users 
          WHERE user_id = auth.uid()
        )
      )
    )
  ); 