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
    const { company_id, id } = req.query;

    // If GET request, handle read operations; otherwise fall through for create/update/delete
    if (req.method === 'GET') {
      // -------------------------
      // 1A. Fetch details for ONE app when id param is provided
      // -------------------------

      if (id) {
        // Get the basic app record (needed to know company_id for stats)
        const { data: appRow, error: appErr } = await supabaseAdmin
          .from('apps')
          .select('*')
          .eq('id', id)
          .single();

        if (appErr || !appRow) {
          return res.status(404).json({ error: 'App not found' });
        }

        // Compute stats using helpers – we need companyId from row
        const companyId = appRow.company_id;

        // Fetch active users once (explicit join path avoids ambiguous relationship)
        const { data: activeCompanyUsers } = await supabaseAdmin
          .from('company_users')
          .select(`
          user_id,
          role,
          status,
          user_profiles:user_profiles!company_users_user_id_fkey ( app_access )
        `)
          .eq('company_id', companyId)
          .eq('status', 'Active');

        const getUserCount = (appType) => {
          if (!activeCompanyUsers) return 0;
          return activeCompanyUsers.filter(cu =>
            cu.role === 'Admin' || cu.role === 'Capacity Admin' ||
            (cu.user_profiles?.app_access || []).includes(appType)
          ).length;
        };

        const getRecordCount = async (appType) => {
          let tableName;
          switch (appType) {
            case 'formulas':
              tableName = 'formulas';
              break;
            case 'raw-materials':
              tableName = 'raw_materials';
              break;
            case 'suppliers':
              tableName = 'suppliers';
              break;
            default:
              return 0;
          }
          const { count } = await supabaseAdmin
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);
          return count || 0;
        };

        const userCount = getUserCount(appRow.app_type);
        const recordCount = await getRecordCount(appRow.app_type);

        const singleApp = {
          id: appRow.id,
          appName: appRow.app_name,
          appDescription: appRow.app_description,
          appIcon: appRow.app_icon,
          appColor: appRow.app_color,
          appType: appRow.app_type,
          status: appRow.status,
          recordCount,
          userCount,
          createdAt: appRow.created_at,
          tableName: appRow.table_name,
          uiConfig: appRow.ui_config,
          schema: appRow.schema,
          permissionsConfig: appRow.permissions
        };

        return res.status(200).json({ success: true, app: singleApp });
      }

      // -------------------------
      // 1B. If no id param, expect company_id to list all apps
      // -------------------------

      // If no company_id provided, list apps across all companies (admin view)

      if (!company_id) {
        const { data: allApps, error: allErr } = await supabaseAdmin
          .from('apps')
          .select('*')
          .order('company_id, app_name');

        if (allErr) {
          return res.status(500).json({ error: 'Failed to fetch apps', details: allErr.message });
        }

        return res.status(200).json({ success: true, apps: allApps });
      }

      // Fetch all active company users once – we'll reuse this for user counts
      const { data: activeCompanyUsers, error: usersError } = await supabaseAdmin
        .from('company_users')
        .select(`
        user_id,
        role,
        status,
        user_profiles:user_profiles!company_users_user_id_fkey ( app_access )
      `)
        .eq('company_id', company_id)
        .eq('status', 'Active');

      if (usersError) {
        console.error('⚠️ Failed to fetch company users for stats:', usersError);
      }

      // Helper to compute userCount for a given appType
      const getUserCountForApp = (appType) => {
        if (!activeCompanyUsers) return 0;
        return activeCompanyUsers.filter(cu =>
          cu.role === 'Admin' || cu.role === 'Capacity Admin' ||
          (cu.user_profiles?.app_access || []).includes(appType)
        ).length;
      };

      // Helper to compute recordCount if not available from view
      const getRecordCountForApp = async (appType) => {
        try {
          let tableName;
          switch (appType) {
            case 'formulas':
              tableName = 'formulas';
              break;
            case 'raw-materials':
              tableName = 'raw_materials';
              break;
            case 'suppliers':
              tableName = 'suppliers';
              break;
            default:
              return 0;
          }
          const { count } = await supabaseAdmin
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .eq('company_id', company_id);
          return count || 0;
        } catch (err) {
          console.error('⚠️ Failed to count records for', appType, err);
          return 0;
        }
      };

      // Try the materialized view first
      let { data: apps, error: appsError } = await supabaseAdmin
        .from('app_details_with_stats')
        .select('*')
        .eq('company_id', company_id)
        .order('app_name');

      let transformedApps = [];

      if (!appsError && apps && apps.length > 0) {
        // Use data from the view but enhance any missing stats
        transformedApps = await Promise.all(apps.map(async (app) => {
          const recordCount = app.record_count ?? await getRecordCountForApp(app.app_type);
          const userCount = app.user_count ?? getUserCountForApp(app.app_type);
          return {
            id: app.id,
            appName: app.app_name,
            appDescription: app.app_description,
            appIcon: app.app_icon,
            appColor: app.app_color,
            appType: app.app_type,
            status: app.status,
            recordCount,
            userCount,
            createdAt: app.created_at
          };
        }));
      } else {
        // Fall back to the apps table directly
        if (appsError) {
          console.warn('View not available / error, falling back to basic query:', appsError);
        }

        const { data: basicApps, error: basicError } = await supabaseAdmin
          .from('apps')
          .select('*')
          .eq('company_id', company_id)
          .order('app_name');

        if (basicError) {
          throw basicError;
        }

        transformedApps = await Promise.all(basicApps.map(async (app) => {
          const recordCount = await getRecordCountForApp(app.app_type);
          const userCount = getUserCountForApp(app.app_type);
          return {
            id: app.id,
            appName: app.app_name,
            appDescription: app.app_description,
            appIcon: app.app_icon,
            appColor: app.app_color,
            appType: app.app_type,
            status: app.status,
            recordCount,
            userCount,
            createdAt: app.created_at
          };
        }));
      }

      return res.status(200).json({
        success: true,
        apps: transformedApps
      });
    }

    // -------------------------
    // 3. Non-GET requests (create/update/delete) – delegate to existing logic
    // -------------------------

    if (req.method === 'POST') {
      console.log('📥 POST /api/admin/apps - Request body:', JSON.stringify(req.body, null, 2));
      
      const { companyId } = req.body || {};
      if (!companyId) {
        console.error('❌ Missing companyId in request');
        return res.status(400).json({ error: 'Company ID is required' });
      }
      
      try {
        const {
          appName,
          appDescription,
          appIcon,
          appColor,
          tableName,
          schema = {},
          uiConfig = {},
          permissions = {},
          appType
        } = req.body;

        if (!appName || !tableName) {
          console.error('❌ Missing required fields:', { appName, tableName });
          return res.status(400).json({ error: 'appName and tableName are required' });
        }
        
        if (!appType) {
          console.error('❌ Missing appType field');
          return res.status(400).json({ error: 'appType is required' });
        }

        // Check if app already exists for this company
        const { data: existingApp, error: checkError } = await supabaseAdmin
          .from('apps')
          .select('*')
          .eq('company_id', companyId)
          .eq('app_type', appType)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('❌ Error checking existing app:', checkError);
          return res.status(500).json({ error: 'Failed to check existing app', details: checkError.message });
        }

        if (existingApp) {
          console.error('❌ App already exists:', existingApp);
          return res.status(409).json({ error: `${appName} app already exists for this company` });
        }

        const insertPayload = {
          company_id: companyId,
          app_name: appName,
          app_description: appDescription || '',
          app_icon: appIcon || 'Database',
          app_color: appColor || '#3B82F6',
          app_type: appType,
          table_name: tableName,
          status: 'active'
        };

        console.log('🔄 Inserting app with payload:', JSON.stringify(insertPayload, null, 2));

        const { data: newApp, error: insertErr } = await supabaseAdmin
          .from('apps')
          .insert(insertPayload)
          .select()
          .single();

        if (insertErr) {
          console.error('❌ Create app insert error:', insertErr);
          return res.status(500).json({ error: 'Failed to create app', details: insertErr.message });
        }

        console.log('✅ Successfully created app:', newApp);
        return res.status(201).json({ success: true, app: newApp });
      } catch (e) {
        console.error('❌ Create app unexpected error:', e);
        return res.status(500).json({ error: 'Internal error', details: e.message });
      }
    }
    // Fallback for other methods
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Apps API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
} 