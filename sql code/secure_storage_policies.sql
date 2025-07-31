-- ==============================================
-- SECURE STORAGE POLICIES FOR FORMULA DOCUMENTS
-- ==============================================
-- Phase 2: Company-based isolation and uploader permissions

-- First, drop the basic policies we created for testing
DROP POLICY IF EXISTS "Allow authenticated uploads to formula documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads from formula documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to formula documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from formula documents" ON storage.objects;

-- ==============================================
-- SECURE POLICY 1: COMPANY-BASED UPLOADS
-- ==============================================
-- Users can only upload to formulas they have access to in their company
CREATE POLICY "Secure company-based uploads" ON storage.objects
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

-- ==============================================
-- SECURE POLICY 2: COMPANY-BASED DOWNLOADS
-- ==============================================
-- Users can only view files from their company's formulas
CREATE POLICY "Secure company-based downloads" ON storage.objects
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

-- ==============================================
-- SECURE POLICY 3: UPLOADER-ONLY UPDATES
-- ==============================================
-- Only the person who uploaded the file can update it
CREATE POLICY "Secure uploader-only updates" ON storage.objects
  FOR UPDATE USING (
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

-- ==============================================
-- SECURE POLICY 4: UPLOADER-ONLY DELETES
-- ==============================================
-- Only the person who uploaded the file can delete it
CREATE POLICY "Secure uploader-only deletes" ON storage.objects
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

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================
-- Check if secure policies are created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Secure storage policies created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Security features implemented:';
    RAISE NOTICE '1. Company-based file isolation';
    RAISE NOTICE '2. Uploader-only permissions for updates/deletes';
    RAISE NOTICE '3. Formula-level access control';
    RAISE NOTICE '4. Multi-tenant security';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test file uploads with different users';
    RAISE NOTICE '2. Verify company isolation works';
    RAISE NOTICE '3. Test uploader-only permissions';
END $$; 