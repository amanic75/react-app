-- Simple Storage Bucket Policies for formula-documents (for testing)
-- Run this after creating the formula-documents bucket in Supabase Storage

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow authenticated users to upload to formula-documents bucket
CREATE POLICY "Allow authenticated users to upload formula documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- Simple policy: Allow authenticated users to view formula documents
CREATE POLICY "Allow authenticated users to view formula documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- Simple policy: Allow authenticated users to update formula documents
CREATE POLICY "Allow authenticated users to update formula documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  );

-- Simple policy: Allow authenticated users to delete formula documents
CREATE POLICY "Allow authenticated users to delete formula documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'formula-documents' AND
    auth.role() = 'authenticated'
  ); 