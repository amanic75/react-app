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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // TODO: Verify admin user permissions (for now, allowing all authenticated users)
    // In production, you'd want to verify the user has NSight Admin role

    console.log('📋 Fetching companies list');

    // Get companies with their apps
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select(`
        *,
        company_apps (
          app_id,
          app_name,
          enabled
        ),
        company_users (
          id,
          user_id,
          role,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (companiesError) {
      console.error('❌ Failed to fetch companies:', companiesError);
      return res.status(500).json({ 
        error: 'Failed to fetch companies',
        details: companiesError.message 
      });
    }

    // Transform data for frontend consumption
    const transformedCompanies = companies.map(company => {
      // Get active apps
      const activeApps = company.company_apps
        .filter(app => app.enabled)
        .map(app => app.app_name);

      // Count active users
      const activeUserCount = company.company_users
        .filter(user => user.status === 'Active').length;

      return {
        id: company.id,
        name: company.company_name,
        industry: company.industry,
        users: activeUserCount,
        apps: activeApps,
        
        // Include all original data for detailed views
        companyName: company.company_name,
        companySize: company.company_size,
        website: company.website,
        country: company.country,
        timezone: company.timezone,
        
        contactName: company.contact_name,
        contactEmail: company.contact_email,
        contactPhone: company.contact_phone,
        contactTitle: company.contact_title,
        
        databaseIsolation: company.database_isolation,
        dataRetention: company.data_retention,
        backupFrequency: company.backup_frequency,
        apiRateLimit: company.api_rate_limit,
        
        dataResidency: company.data_residency,
        complianceStandards: company.compliance_standards,
        ssoEnabled: company.sso_enabled,
        twoFactorRequired: company.two_factor_required,
        
        subscriptionTier: company.subscription_tier,
        billingContact: company.billing_contact,
        billingEmail: company.billing_email,
        paymentMethod: company.payment_method,
        
        adminUserName: company.admin_user_name,
        adminUserEmail: company.admin_user_email,
        defaultDepartments: company.default_departments,
        initialApps: company.initial_apps,
        
        status: company.status,
        setupComplete: company.setup_complete,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      };
    });

    console.log(`✅ Found ${transformedCompanies.length} companies`);

    return res.status(200).json({
      success: true,
      companies: transformedCompanies,
      count: transformedCompanies.length
    });

  } catch (error) {
    console.error('❌ Companies list API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 