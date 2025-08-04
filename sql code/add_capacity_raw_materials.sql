-- Add missing Raw Materials app for Capacity Chemicals
-- This will give Capacity admins access to 3 apps: Formulas, Raw Materials, Suppliers

INSERT INTO company_apps (id, company_id, app_id, app_name, enabled, configuration, deployed_at, deployed_by)
VALUES (
  gen_random_uuid(),
  'f42538be-9dcb-493a-9e2e-8b10691ace25', -- Capacity Chemicals company_id
  'raw-materials',
  'Raw Materials',
  true,
  '{}',
  NOW(),
  NULL
);

-- Verify the result
SELECT 
  ca.app_name,
  c.company_name
FROM company_apps ca
JOIN companies c ON ca.company_id = c.id
WHERE c.company_name = 'Capacity Chemicals'
ORDER BY ca.app_name;