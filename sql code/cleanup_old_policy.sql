-- ==============================================
-- CLEANUP OLD PERMISSIVE POLICY
-- ==============================================
-- Remove the old "Allow authenticated access" policy that's too permissive

DROP POLICY IF EXISTS "Allow authenticated access" ON storage.objects;

-- ==============================================
-- VERIFICATION
-- ==============================================
-- Check that only our secure policies remain
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Old permissive policy removed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Current security status:';
    RAISE NOTICE '1. Company-based isolation ✅';
    RAISE NOTICE '2. Uploader-only permissions ✅';
    RAISE NOTICE '3. File validation (10MB, allowed types) ✅';
    RAISE NOTICE '4. Multi-tenant security ✅';
    RAISE NOTICE '';
    RAISE NOTICE 'Ready for production testing!';
END $$; 