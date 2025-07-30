# Enable Leaked Password Protection

## Problem
Supabase Auth's leaked password protection is currently disabled, which means users can use compromised passwords.

## Solution
Enable leaked password protection in Supabase Dashboard:

### Steps:
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll down to **Password Security**
4. Enable **"Prevent use of compromised passwords"**
5. Save changes

### What this does:
- Checks new passwords against HaveIBeenPwned.org database
- Prevents users from using known compromised passwords
- Enhances overall security posture

### Alternative: Enable via SQL
```sql
-- This is typically done via dashboard, but you can also check current settings
SELECT * FROM auth.config WHERE key = 'password_require_compromised_check';
```

## Benefits
- Prevents use of passwords from data breaches
- Reduces risk of credential stuffing attacks
- Improves overall account security
- Meets security compliance requirements

## Note
This feature requires an active internet connection to check against the HaveIBeenPwned.org API. 