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
      // console.error removed
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Route based on method
    switch (req.method) {
      case 'GET':
        return await getCompanySyncStatus(req, res);
      case 'POST':
        return await syncCompaniesWithUsers(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// GET /api/admin/company-sync - Get sync status
async function getCompanySyncStatus(req, res) {
  // console.log removed

  try {
    // Get all companies (simplified query to avoid relationship conflicts)
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select(`
        id,
        company_name,
        admin_user_name,
        admin_user_email,
        status,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (companiesError) {
      // console.error removed
      return res.status(500).json({ 
        error: 'Failed to fetch companies',
        details: companiesError.message 
      });
    }

    // Return simplified company info (without relationship data to avoid conflicts)
    const syncStatus = companies.map(company => {
      return {
        company: {
          id: company.id,
          name: company.company_name,
          adminUserName: company.admin_user_name,
          adminUserEmail: company.admin_user_email,
          status: company.status,
          createdAt: company.created_at
        },
        syncStatus: {
          hasAdminUser: false, // We'll check this separately if needed
          adminUserExists: false,
          adminUserCount: 0,
          needsSync: true // Always assume needs sync for simplicity
        },
        adminUsers: [] // Empty for now to avoid relationship conflicts
      };
    });

    const summary = {
      totalCompanies: companies.length,
      companiesNeedingSync: syncStatus.filter(s => s.syncStatus.needsSync).length,
      companiesSynced: syncStatus.filter(s => !s.syncStatus.needsSync).length
    };

    // console.log removed

    return res.status(200).json({
      success: true,
      summary,
      companies: syncStatus
    });

  } catch (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Failed to check sync status',
      details: error.message 
    });
  }
}

// POST /api/admin/company-sync - Sync companies with their admin users
async function syncCompaniesWithUsers(req, res) {
  // console.log removed

  try {
    // Get all companies that need syncing (simplified query to avoid relationship conflicts)
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select(`
        id,
        company_name,
        admin_user_name,
        admin_user_email,
        status,
        created_at
      `)
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

    if (companiesError) {
      // console.error removed
      return res.status(500).json({ 
        error: 'Failed to fetch companies for sync',
        details: companiesError.message 
      });
    }

    const syncResults = {
      processed: 0,
      created: 0,
      linked: 0,
      errors: 0,
      details: []
    };

    // Process each company
    for (const company of companies) {
      syncResults.processed++;
      // console.log removed

      try {
        // Check if admin user already exists and is linked to this company via company_users table
        const { data: existingUserLink, error: existingLinkError } = await supabaseAdmin
          .from('company_users')
          .select('user_id, role')
          .eq('company_id', company.id)
          .eq('status', 'Active')
          .single();

        if (existingUserLink && !existingLinkError) {
          // console.log removed
          syncResults.details.push({
            company: company.company_name,
            action: 'skipped',
            reason: 'Already has valid admin user'
          });
          continue;
        }

        // Look for existing user with admin email
        const { data: existingUser, error: userError } = await supabaseAdmin
          .from('user_profiles')
          .select('id, email, first_name, last_name, role')
          .eq('email', company.admin_user_email)
          .single();

        let userId = existingUser?.id;

        if (!existingUser) {
          // console.log removed
          
          // Create new user account
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: company.admin_user_email,
            password: 'ChangeMe123!', // Default password - should be changed
            email_confirm: true,
            user_metadata: {
              first_name: company.admin_user_name.split(' ')[0] || '',
              last_name: company.admin_user_name.split(' ').slice(1).join(' ') || '',
              role: 'Capacity Admin'
            }
          });

          if (authError) {
            // console.error removed
            syncResults.errors++;
            syncResults.details.push({
              company: company.company_name,
              action: 'error',
              reason: `Failed to create auth user: ${authError.message}`
            });
            continue;
          }

          userId = authData.user.id;

          // Create user profile
          const { data: profileData, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .insert([{
              id: userId,
              email: company.admin_user_email,
              first_name: company.admin_user_name.split(' ')[0] || '',
              last_name: company.admin_user_name.split(' ').slice(1).join(' ') || '',
              role: 'Capacity Admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (profileError) {
            // console.error removed
            syncResults.errors++;
            syncResults.details.push({
              company: company.company_name,
              action: 'error',
              reason: `Failed to create user profile: ${profileError.message}`
            });
            continue;
          }

          // console.log removed
          syncResults.created++;
        } else {
          // console.log removed
          
          // Update user role to Capacity Admin if needed
          if (existingUser.role !== 'Capacity Admin') {
            const { error: roleUpdateError } = await supabaseAdmin
              .from('user_profiles')
              .update({
                role: 'Capacity Admin',
                updated_at: new Date().toISOString()
              })
              .eq('id', existingUser.id);

            if (roleUpdateError) {
              // console.error removed
            } else {
              // console.log removed
            }
          }
        }

        // Link user to company via company_users table
        const { error: companyLinkError } = await supabaseAdmin
          .from('company_users')
          .upsert([{
            company_id: company.id,
            user_id: userId,
            role: 'Admin',
            status: 'Active',
            added_at: new Date().toISOString()
          }], { 
            onConflict: 'company_id,user_id',
            ignoreDuplicates: false 
          });

        if (companyLinkError) {
          // console.error removed
          syncResults.errors++;
          syncResults.details.push({
            company: company.company_name,
            action: 'error',
            reason: `Failed to link user to company: ${companyLinkError.message}`
          });
          continue;
        }

        // console.log removed
        syncResults.linked++;
        syncResults.details.push({
          company: company.company_name,
          action: 'linked',
          reason: 'Successfully linked admin user to company'
        });

      } catch (error) {
        // console.error removed
        syncResults.errors++;
        syncResults.details.push({
          company: company.company_name,
          action: 'error',
          reason: error.message
        });
      }
    }

    // console.log removed

    return res.status(200).json({
      success: true,
      message: 'Company-user sync completed',
      results: syncResults
    });

  } catch (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Failed to sync companies with users',
      details: error.message 
    });
  }
} 