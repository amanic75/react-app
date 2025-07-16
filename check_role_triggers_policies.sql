-- Check for triggers or policies that might be overriding role assignments

-- 1. Check for any triggers on user_profiles table
SELECT 
  tgname as trigger_name,
  tgtype,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'user_profiles'::regclass;

-- 2. Check for any triggers on company_users table
SELECT 
  tgname as trigger_name,
  tgtype,
  proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgrelid = 'company_users'::regclass;

-- 3. Check RLS policies on user_profiles
SELECT 
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles,
  CASE polpermissive 
    WHEN true THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as type,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy
WHERE polrelid = 'user_profiles'::regclass;

-- 4. Check RLS policies on company_users
SELECT 
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles,
  CASE polpermissive 
    WHEN true THEN 'PERMISSIVE'
    ELSE 'RESTRICTIVE'
  END as type,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy
WHERE polrelid = 'company_users'::regclass;

-- 5. Check default values for role columns
SELECT 
  column_name,
  column_default
FROM information_schema.columns
WHERE table_name IN ('user_profiles', 'company_users')
AND column_name = 'role';

-- 6. Check if there's a function that sets default roles
SELECT 
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%role%'
OR p.proname LIKE '%user%profile%'
OR p.proname LIKE '%company%user%'; 