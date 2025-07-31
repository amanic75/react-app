-- ==============================================
-- CHECK AND FIX FORMULA_DOCUMENTS RLS POLICIES
-- ==============================================

-- First, check if RLS is enabled on formula_documents
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'formula_documents';

-- Check existing policies on formula_documents
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'formula_documents'
ORDER BY policyname;

-- Enable RLS if not already enabled
ALTER TABLE formula_documents ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON formula_documents;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON formula_documents;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON formula_documents;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON formula_documents;

-- Create simple, working policies for formula_documents
CREATE POLICY "Allow authenticated users to read formula documents" ON formula_documents
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to insert formula documents" ON formula_documents
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to update formula documents" ON formula_documents
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to delete formula documents" ON formula_documents
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

-- Verify the policies were created
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'formula_documents'
ORDER BY policyname;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Formula documents RLS policies created!';
    RAISE NOTICE '';
    RAISE NOTICE 'Policies created:';
    RAISE NOTICE '1. SELECT - Company-based read access';
    RAISE NOTICE '2. INSERT - Company-based insert access';
    RAISE NOTICE '3. UPDATE - Company-based update access';
    RAISE NOTICE '4. DELETE - Company-based delete access';
    RAISE NOTICE '';
    RAISE NOTICE 'Try deleting a file again!';
END $$; 