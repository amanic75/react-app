# SQL Folder Structure & Usage

## Core Setup Scripts
- `01_core_schema.sql`: Main database schema (tables, types, etc.)
- `02_security_policies.sql`: RLS, security, and access policies
- `03_sample_data.sql`: Sample/seed data for dev/testing
- `database_complete_setup.sql`: Full setup script (may duplicate above)
- `multi_tenant_schema.sql`: Multi-tenant schema additions
- `disable_user_validation_triggers.sql`: Utility for disabling triggers (use with caution)

## Archive
- See `archive/` subfolder for one-off, superseded, or emergency fix scripts, as well as old migrations and data patches. These are for reference only and should not be used for new setups.

## How to Use
1. **Fresh Setup:**
   - Run `01_core_schema.sql`, then `02_security_policies.sql`, then `03_sample_data.sql` (in that order).
   - For multi-tenant: also run `multi_tenant_schema.sql` after the core schema.
   - If needed, use `database_complete_setup.sql` for a full setup (check for overlap with above scripts).
2. **Reference:**
   - Use scripts in `archive/` to understand past migrations, bugfixes, or data changes.
   - Do not run archive scripts unless you know exactly what they do and why.

## Notes
- Always review scripts before running in production.
- Keep this README updated as you add or remove scripts. 