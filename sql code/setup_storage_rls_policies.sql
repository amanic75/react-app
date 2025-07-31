-- ==============================================
-- SETUP STORAGE RLS POLICIES FOR FORMULA DOCUMENTS
-- ==============================================
-- This file sets up Row Level Security policies for the storage.objects table
-- to control access to files in the formula-documents bucket

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- POLICY 1: ALLOW AUTHENTICATED USERS TO UPLOAD
-- ==============================================
-- Users can upload files to formula-documents bucket if they're authenticated
CREATE POLICY "Allow authenticated uploads to formula documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- POLICY 2: ALLOW AUTHENTICATED USERS TO VIEW
-- ==============================================
-- Users can view/download files from formula-documents bucket if they're authenticated
CREATE POLICY "Allow authenticated downloads from formula documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- POLICY 3: ALLOW AUTHENTICATED USERS TO UPDATE
-- ==============================================
-- Users can update files in formula-documents bucket if they're authenticated
CREATE POLICY "Allow authenticated updates to formula documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- POLICY 4: ALLOW AUTHENTICATED USERS TO DELETE
-- ==============================================
-- Users can delete files from formula-documents bucket if they're authenticated
CREATE POLICY "Allow authenticated deletes from formula documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- ==============================================
-- ADVANCED POLICIES (FOR FUTURE USE)
-- ==============================================
-- Uncomment these policies when you want company-level isolation

/*
-- Company-based upload policy (more secure)
CREATE POLICY "Allow company-based uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated' AND
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

-- Company-based view policy (more secure)
CREATE POLICY "Allow company-based downloads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated' AND
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

-- Uploader-only delete policy (more secure)
CREATE POLICY "Allow uploader-only deletes" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated' AND
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
*/

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Run these queries to verify the policies are working

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- List all policies on storage.objects
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Storage RLS policies created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '1. Allow authenticated uploads to formula documents';
    RAISE NOTICE '2. Allow authenticated downloads from formula documents';
    RAISE NOTICE '3. Allow authenticated updates to formula documents';
    RAISE NOTICE '4. Allow authenticated deletes from formula documents';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test file uploads in your application';
    RAISE NOTICE '2. If uploads work, consider enabling advanced policies';
    RAISE NOTICE '3. Monitor for any access issues';
END $$; 