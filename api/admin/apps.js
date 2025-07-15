import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Route based on URL path and method
    const { id, company_id } = req.query;
    
    if (id) {
      // Operations on specific app: /api/admin/apps?id=123
      switch (req.method) {
        case 'GET':
          return await getApp(req, res, id);
        case 'PUT':
          return await updateApp(req, res, id);
        case 'DELETE':
          return await deleteApp(req, res, id);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      // Operations on apps collection: /api/admin/apps or /api/admin/apps?company_id=123
      switch (req.method) {
        case 'GET':
          return await getApps(req, res, company_id);
        case 'POST':
          return await createApp(req, res);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }
  } catch (error) {
    console.error('❌ API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all apps or apps for a specific company
async function getApps(req, res, companyId = null) {
  try {
    let query = supabaseAdmin
      .from('apps')
      .select(`
        *,
        companies!inner(id, company_name),
        user_profiles!apps_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Filter by company if specified
    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: apps, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch apps' });
    }

    console.log(`✅ Retrieved ${apps.length} apps${companyId ? ` for company ${companyId}` : ''}`);

    return res.status(200).json({
      success: true,
      apps: apps.map(app => ({
        id: app.id,
        appName: app.app_name,
        appDescription: app.app_description,
        appIcon: app.app_icon,
        appColor: app.app_color,
        category: app.category,
        tableName: app.table_name,
        schema: app.schema_json,
        uiConfig: app.ui_config,
        permissionsConfig: app.permissions_config,
        status: app.status,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        company: {
          id: app.companies.id,
          name: app.companies.company_name
        },
        createdBy: app.user_profiles ? {
          id: app.user_profiles.id,
          name: `${app.user_profiles.first_name || ''} ${app.user_profiles.last_name || ''}`.trim(),
          email: app.user_profiles.email
        } : null
      }))
    });

  } catch (error) {
    console.error('Error in getApps:', error);
    return res.status(500).json({ error: 'Failed to fetch apps' });
  }
}

// Get a specific app by ID
async function getApp(req, res, appId) {
  try {
    const { data: app, error } = await supabaseAdmin
      .from('apps')
      .select(`
        *,
        companies!inner(id, company_name),
        user_profiles!apps_created_by_fkey(id, first_name, last_name, email)
      `)
      .eq('id', appId)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'App not found' });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch app' });
    }

    // Get app data count
    const { count: recordCount } = await supabaseAdmin
      .from('app_data')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    // Get app permissions count
    const { count: userCount } = await supabaseAdmin
      .from('app_permissions')
      .select('*', { count: 'exact', head: true })
      .eq('app_id', appId);

    console.log(`✅ Retrieved app: ${app.app_name}`);

    return res.status(200).json({
      success: true,
      app: {
        id: app.id,
        appName: app.app_name,
        appDescription: app.app_description,
        appIcon: app.app_icon,
        appColor: app.app_color,
        category: app.category,
        tableName: app.table_name,
        schema: app.schema_json,
        uiConfig: app.ui_config,
        permissionsConfig: app.permissions_config,
        status: app.status,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
        recordCount: recordCount || 0,
        userCount: userCount || 0,
        company: {
          id: app.companies.id,
          name: app.companies.company_name
        },
        createdBy: app.user_profiles ? {
          id: app.user_profiles.id,
          name: `${app.user_profiles.first_name || ''} ${app.user_profiles.last_name || ''}`.trim(),
          email: app.user_profiles.email
        } : null
      }
    });

  } catch (error) {
    console.error('Error in getApp:', error);
    return res.status(500).json({ error: 'Failed to fetch app' });
  }
}

// Create a new app
async function createApp(req, res) {
  try {
    const {
      appName,
      appDescription,
      appIcon = 'Database',
      appColor = '#3B82F6',
      category = 'business',
      companyId,
      targetCompany, // fallback for compatibility
      tableName,
      fields = [],
      schema, // direct schema object
      uiConfig, // direct uiConfig object
      permissions, // direct permissions object
      showInDashboard = true,
      enableSearch = true,
      enableFilters = true,
      enableExport = true,
      adminAccess = ['create', 'read', 'update', 'delete'],
      userAccess = ['read'],
      managerAccess = ['create', 'read', 'update']
    } = req.body;

    // Use companyId if provided, fallback to targetCompany
    const companyIdToUse = companyId || targetCompany;

    // Validate required fields
    if (!appName || !appDescription || !companyIdToUse || !tableName) {
      return res.status(400).json({ 
        error: 'Missing required fields: appName, appDescription, companyId, tableName' 
      });
    }

    // Validate company exists
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, company_name')
      .eq('id', companyIdToUse)
      .single();

    if (companyError || !company) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    // Build schema JSON from fields or use direct schema
    const schemaJson = schema || {
      fields: fields.map(field => ({
        name: field.fieldName || field.name,
        type: field.type,
        label: field.label,
        required: field.required || false,
        config: field
      }))
    };

    // Build UI config - use provided uiConfig or build from individual settings
    const finalUiConfig = uiConfig || {
      showInDashboard,
      enableSearch,
      enableFilters,
      enableExport
    };

    // Build permissions config - use provided permissions or build from individual settings
    const finalPermissionsConfig = permissions || {
      adminAccess,
      managerAccess,
      userAccess
    };

    // Insert the new app
    const { data: newApp, error } = await supabaseAdmin
      .from('apps')
      .insert({
        company_id: companyIdToUse,
        app_name: appName,
        app_description: appDescription,
        app_icon: appIcon,
        app_color: appColor,
        category,
        table_name: tableName,
        schema_json: schemaJson,
        ui_config: finalUiConfig,
        permissions_config: finalPermissionsConfig,
        // created_by: null // TODO: Get from authenticated user - will be handled by RLS
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ 
          error: 'App name or table name already exists for this company' 
        });
      }
      return res.status(500).json({ error: 'Failed to create app' });
    }

    console.log(`✅ Created app: ${newApp.app_name} for company: ${company.company_name}`);

    return res.status(201).json({
      success: true,
      message: `App "${newApp.app_name}" created successfully`,
      app: {
        id: newApp.id,
        appName: newApp.app_name,
        appDescription: newApp.app_description,
        appIcon: newApp.app_icon,
        appColor: newApp.app_color,
        category: newApp.category,
        tableName: newApp.table_name,
        schema: newApp.schema_json,
        uiConfig: newApp.ui_config,
        permissionsConfig: newApp.permissions_config,
        status: newApp.status,
        createdAt: newApp.created_at,
        company: {
          id: company.id,
          name: company.company_name
        }
      }
    });

  } catch (error) {
    console.error('Error in createApp:', error);
    return res.status(500).json({ error: 'Failed to create app' });
  }
}

// Update an existing app
async function updateApp(req, res, appId) {
  try {
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.created_by;

    // Convert frontend field names to database field names
    const dbUpdates = {};
    if (updates.appName) dbUpdates.app_name = updates.appName;
    if (updates.appDescription) dbUpdates.app_description = updates.appDescription;
    if (updates.appIcon) dbUpdates.app_icon = updates.appIcon;
    if (updates.appColor) dbUpdates.app_color = updates.appColor;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.tableName) dbUpdates.table_name = updates.tableName;
    if (updates.schema) dbUpdates.schema_json = updates.schema;
    if (updates.uiConfig) dbUpdates.ui_config = updates.uiConfig;
    if (updates.permissionsConfig) dbUpdates.permissions_config = updates.permissionsConfig;
    if (updates.status) dbUpdates.status = updates.status;

    const { data: updatedApp, error } = await supabaseAdmin
      .from('apps')
      .update(dbUpdates)
      .eq('id', appId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'App not found' });
      }
      return res.status(500).json({ error: 'Failed to update app' });
    }

    console.log(`✅ Updated app: ${updatedApp.app_name}`);

    return res.status(200).json({
      success: true,
      message: `App "${updatedApp.app_name}" updated successfully`,
      app: updatedApp
    });

  } catch (error) {
    console.error('Error in updateApp:', error);
    return res.status(500).json({ error: 'Failed to update app' });
  }
}

// Delete an app (soft delete by setting status to 'deleted')
async function deleteApp(req, res, appId) {
  try {
    const { data: deletedApp, error } = await supabaseAdmin
      .from('apps')
      .update({ status: 'deleted' })
      .eq('id', appId)
      .select('app_name')
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'App not found' });
      }
      return res.status(500).json({ error: 'Failed to delete app' });
    }

    console.log(`✅ Deleted app: ${deletedApp.app_name}`);

    return res.status(200).json({
      success: true,
      message: `App "${deletedApp.app_name}" deleted successfully`
    });

  } catch (error) {
    console.error('Error in deleteApp:', error);
    return res.status(500).json({ error: 'Failed to delete app' });
  }
} 