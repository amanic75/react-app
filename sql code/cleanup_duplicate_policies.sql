-- ==============================================
-- CLEANUP DUPLICATE FORMULA_DOCUMENTS POLICIES
-- ==============================================
-- Remove duplicate policies that are causing conflicts

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read formula documents" ON formula_documents;
DROP POLICY IF EXISTS "Allow authenticated users to insert formula documents" ON formula_documents;
DROP POLICY IF EXISTS "Allow authenticated users to update formula documents" ON formula_documents;
DROP POLICY IF EXISTS "Allow authenticated users to delete formula documents" ON formula_documents;
DROP POLICY IF EXISTS "Users can view documents for formulas in their company" ON formula_documents;
DROP POLICY IF EXISTS "Users can insert documents for formulas in their company" ON formula_documents;
DROP POLICY IF EXISTS "Users can update documents they uploaded" ON formula_documents;
DROP POLICY IF EXISTS "Users can delete documents they uploaded" ON formula_documents;

-- Create clean, simple policies
CREATE POLICY "formula_documents_select_policy" ON formula_documents
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "formula_documents_insert_policy" ON formula_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "formula_documents_update_policy" ON formula_documents
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "formula_documents_delete_policy" ON formula_documents
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

-- Verify only clean policies remain
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'formula_documents'
ORDER BY policyname;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Duplicate policies cleaned up!';
    RAISE NOTICE '';
    RAISE NOTICE 'Clean policies created:';
    RAISE NOTICE '1. formula_documents_select_policy';
    RAISE NOTICE '2. formula_documents_insert_policy';
    RAISE NOTICE '3. formula_documents_update_policy';
    RAISE NOTICE '4. formula_documents_delete_policy';
    RAISE NOTICE '';
    RAISE NOTICE 'Try deleting a file again - should work now!';
END $$; 