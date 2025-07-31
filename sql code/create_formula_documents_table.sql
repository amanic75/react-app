-- Create formula_documents table for storing file metadata
CREATE TABLE IF NOT EXISTS formula_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  formula_id TEXT NOT NULL REFERENCES formulas(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  company_id UUID REFERENCES companies(id),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_formula_documents_formula_id ON formula_documents(formula_id);
CREATE INDEX IF NOT EXISTS idx_formula_documents_company_id ON formula_documents(company_id);
CREATE INDEX IF NOT EXISTS idx_formula_documents_uploaded_by ON formula_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_formula_documents_is_deleted ON formula_documents(is_deleted);

-- Enable RLS
ALTER TABLE formula_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view documents for formulas in their company" ON formula_documents
  FOR SELECT USING (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents for formulas in their company" ON formula_documents
  FOR INSERT WITH CHECK (
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update documents they uploaded" ON formula_documents
  FOR UPDATE USING (
    uploaded_by = auth.uid() AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete documents they uploaded" ON formula_documents
  FOR DELETE USING (
    uploaded_by = auth.uid() AND
    company_id IN (
      SELECT company_id FROM company_users 
      WHERE user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE formula_documents IS 'Stores metadata for files uploaded to formulas';
COMMENT ON COLUMN formula_documents.storage_path IS 'Path to file in Supabase Storage bucket';
COMMENT ON COLUMN formula_documents.is_deleted IS 'Soft delete flag - file is marked as deleted but not physically removed'; 