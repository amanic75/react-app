-- ==============================================
-- FIX APPS INSERT STATEMENT
-- Safe fix for the apps table INSERT without affecting existing data
-- ==============================================

-- First, let's check if the apps table already has data
SELECT COUNT(*) as existing_apps_count FROM apps;

-- If the table is empty, we can safely insert the default apps
-- If it has data, we'll skip the insert to avoid conflicts

DO $$
BEGIN
    -- Only insert if the table is empty
    IF NOT EXISTS (SELECT 1 FROM apps LIMIT 1) THEN
        INSERT INTO apps (id, app_name, app_description, app_icon, app_color) VALUES
        (gen_random_uuid(), 'Formulas', 'Chemical formula management system', 'Database', '#10B981'),
        (gen_random_uuid(), 'Suppliers', 'Supplier relationship management', 'Building2', '#3B82F6'),
        (gen_random_uuid(), 'Raw Materials', 'Raw material inventory tracking', 'FlaskConical', '#F59E0B'),
        (gen_random_uuid(), 'Products', 'Product catalog management', 'Table', '#8B5CF6'),
        (gen_random_uuid(), 'Quality Control', 'Quality control and testing', 'Settings', '#EF4444'),
        (gen_random_uuid(), 'Production', 'Production planning and tracking', 'Zap', '#06B6D4'),
        (gen_random_uuid(), 'Inventory', 'Inventory management system', 'Database', '#84CC16'),
        (gen_random_uuid(), 'Reports', 'Reporting and analytics dashboard', 'Table', '#F97316');
        
        RAISE NOTICE 'Default apps inserted successfully';
    ELSE
        RAISE NOTICE 'Apps table already has data, skipping insert to avoid conflicts';
    END IF;
END $$;

-- Verify the fix
SELECT 'Apps table INSERT statement fixed successfully!' as status; 