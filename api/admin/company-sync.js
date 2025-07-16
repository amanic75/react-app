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
    console.error('❌ Company sync error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// GET /api/admin/company-sync - Get sync status
async function getCompanySyncStatus(req, res) {
  console.log('📋 Checking company sync status');

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
      console.error('❌ Failed to fetch companies:', companiesError);
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

    console.log(`✅ Sync status retrieved: ${summary.companiesNeedingSync}/${summary.totalCompanies} companies need sync`);

    return res.status(200).json({
      success: true,
      summary,
      companies: syncStatus
    });

  } catch (error) {
    console.error('❌ Error checking sync status:', error);
    return res.status(500).json({ 
      error: 'Failed to check sync status',
      details: error.message 
    });
  }
}

// POST /api/admin/company-sync - Sync companies with their admin users
async function syncCompaniesWithUsers(req, res) {
  console.log('🔄 Starting company-user sync process');

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
      console.error('❌ Failed to fetch companies for sync:', companiesError);
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
      console.log(`🔄 Processing company: ${company.company_name} (${company.admin_user_email})`);

      try {
        // Check if admin user already exists and is linked to this company via company_users table
        const { data: existingUserLink, error: existingLinkError } = await supabaseAdmin
          .from('company_users')
          .select('user_id, role')
          .eq('company_id', company.id)
          .eq('status', 'Active')
          .single();

        if (existingUserLink && !existingLinkError) {
          console.log(`✅ Company ${company.company_name} already has valid admin user`);
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
          console.log(`🆕 Creating new admin user for company: ${company.company_name}`);
          
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
            console.error(`❌ Failed to create auth user for ${company.admin_user_email}:`, authError);
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
            console.error(`❌ Failed to create profile for ${company.admin_user_email}:`, profileError);
            syncResults.errors++;
            syncResults.details.push({
              company: company.company_name,
              action: 'error',
              reason: `Failed to create user profile: ${profileError.message}`
            });
            continue;
          }

          console.log(`✅ Created new admin user: ${company.admin_user_email}`);
          syncResults.created++;
        } else {
          console.log(`👤 Found existing user: ${company.admin_user_email}`);
          
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
              console.error(`❌ Failed to update role for ${company.admin_user_email}:`, roleUpdateError);
            } else {
              console.log(`✅ Updated role to Capacity Admin for ${company.admin_user_email}`);
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
          console.error(`❌ Failed to link user to company ${company.company_name}:`, companyLinkError);
          syncResults.errors++;
          syncResults.details.push({
            company: company.company_name,
            action: 'error',
            reason: `Failed to link user to company: ${companyLinkError.message}`
          });
          continue;
        }

        console.log(`✅ Successfully linked ${company.admin_user_email} to ${company.company_name}`);
        syncResults.linked++;
        syncResults.details.push({
          company: company.company_name,
          action: 'linked',
          reason: 'Successfully linked admin user to company'
        });

      } catch (error) {
        console.error(`❌ Error processing company ${company.company_name}:`, error);
        syncResults.errors++;
        syncResults.details.push({
          company: company.company_name,
          action: 'error',
          reason: error.message
        });
      }
    }

    console.log(`✅ Sync completed: ${syncResults.created} created, ${syncResults.linked} linked, ${syncResults.errors} errors`);

    return res.status(200).json({
      success: true,
      message: 'Company-user sync completed',
      results: syncResults
    });

  } catch (error) {
    console.error('❌ Error during sync process:', error);
    return res.status(500).json({ 
      error: 'Failed to sync companies with users',
      details: error.message 
    });
  }
} 