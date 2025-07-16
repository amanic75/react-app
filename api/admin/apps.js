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
    const { company_id } = req.query;

    if (!company_id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Fetch apps with statistics from the view
    const { data: apps, error: appsError } = await supabaseAdmin
      .from('app_details_with_stats')
      .select('*')
      .eq('company_id', company_id)
      .order('app_name');

    if (appsError) {
      // Fallback to basic apps query if view doesn't exist
      console.warn('View not available, falling back to basic query:', appsError);
      
      const { data: basicApps, error: basicError } = await supabaseAdmin
        .from('apps')
        .select('*')
        .eq('company_id', company_id)
        .order('app_name');

      if (basicError) {
        throw basicError;
      }

      // Transform basic apps to match expected format
      const transformedApps = await Promise.all(basicApps.map(async (app) => {
        // Get statistics manually
        let recordCount = 0;
        let userCount = 0;

        try {
          // Get record count
          if (app.app_type === 'formulas') {
            const { count } = await supabaseAdmin
              .from('formulas')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company_id);
            recordCount = count || 0;
          } else if (app.app_type === 'raw-materials') {
            const { count } = await supabaseAdmin
              .from('raw_materials')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company_id);
            recordCount = count || 0;
          } else if (app.app_type === 'suppliers') {
            const { count } = await supabaseAdmin
              .from('suppliers')
              .select('*', { count: 'exact', head: true })
              .eq('company_id', company_id);
            recordCount = count || 0;
          }

          // Get user count (users with access to this app)
          const { data: companyUsers } = await supabaseAdmin
            .from('company_users')
      .select(`
              user_id,
              role,
              user_profiles!inner(app_access)
            `)
            .eq('company_id', company_id)
            .eq('status', 'Active');

          if (companyUsers) {
            userCount = companyUsers.filter(cu => 
              cu.role === 'Admin' || 
              cu.user_profiles?.app_access?.includes(app.app_type)
            ).length;
          }
        } catch (error) {
          console.error('Error getting statistics:', error);
        }

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

    return res.status(200).json({
      success: true,
        apps: transformedApps
      });
    }

    // Transform data from view
    const transformedApps = apps.map(app => ({
        id: app.id,
        appName: app.app_name,
        appDescription: app.app_description,
        appIcon: app.app_icon,
        appColor: app.app_color,
      appType: app.app_type,
        status: app.status,
      recordCount: app.record_count,
      userCount: app.user_count,
      createdAt: app.created_at
    }));

    return res.status(200).json({
      success: true,
      apps: transformedApps
    });

  } catch (error) {
    console.error('❌ Apps API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 