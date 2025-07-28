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

    // Route based on URL path and method
    const { id, action } = req.query;
    // console.log removed
    
    if (id) {
      // Operations on specific company: /api/admin/companies?id=123
      switch (req.method) {
        case 'GET':
          // Handle specific actions
          if (action === 'get-apps') {
            // console.log removed
            return await getCompanyApps(req, res, id);
          }
          // console.log removed
          return await getCompany(req, res, id);
        case 'PUT':
          return await updateCompany(req, res, id);
        case 'DELETE':
          return await deleteCompany(req, res, id);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    } else {
      // Operations on companies collection: /api/admin/companies
      switch (req.method) {
        case 'GET':
          return await listCompanies(req, res);
        case 'POST':
          // Handle repair action
          // console.log removed
          if (action === 'repair-user-links') {
            // console.log removed
            return await repairUserLinks(req, res);
          }
          if (action === 'fix-user-profile') {
            // console.log removed
            return await fixUserProfile(req, res);
          }
          // console.log removed
          return await createCompany(req, res);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

  } catch (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// POST /api/admin/companies - Create new company
async function createCompany(req, res) {
  const companyData = req.body;

  // Validate required fields
  const requiredFields = [
    'companyName', 'industry', 'contactName', 'contactEmail',
    'billingContact', 'billingEmail', 'adminUserName', 'adminUserEmail'
  ];

  const missingFields = requiredFields.filter(field => !companyData[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      missingFields: missingFields
    });
  }

  // Validate email formats
  const emailFields = ['contactEmail', 'billingEmail', 'adminUserEmail'];
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  for (const field of emailFields) {
    if (companyData[field] && !emailRegex.test(companyData[field])) {
      return res.status(400).json({ 
        error: `Invalid email format for ${field}`,
        field: field
      });
    }
  }

  // console.log removed

  // Transform frontend data to database schema
  const dbCompanyData = {
    // Step 1: Basic Company Information
    company_name: companyData.companyName,
    industry: companyData.industry,
    company_size: companyData.companySize,
    website: companyData.website || null,
    country: companyData.country,
    timezone: companyData.timezone,
    
    // Step 2: Primary Contact
    contact_name: companyData.contactName,
    contact_email: companyData.contactEmail,
    contact_phone: companyData.contactPhone || null,
    contact_title: companyData.contactTitle,
    
    // Step 3: Technical Configuration
    database_isolation: companyData.databaseIsolation,
    data_retention: companyData.dataRetention,
    backup_frequency: companyData.backupFrequency,
    api_rate_limit: parseInt(companyData.apiRateLimit),
    
    // Step 4: Security & Compliance
    data_residency: companyData.dataResidency,
    compliance_standards: companyData.complianceStandards,
    sso_enabled: companyData.ssoEnabled,
    two_factor_required: companyData.twoFactorRequired,
    
    // Step 5: Subscription & Billing
    subscription_tier: companyData.subscriptionTier,
    billing_contact: companyData.billingContact,
    billing_email: companyData.billingEmail,
    payment_method: companyData.paymentMethod,
    
    // Step 6: Initial Setup
    admin_user_name: companyData.adminUserName,
    admin_user_email: companyData.adminUserEmail,
    default_departments: companyData.defaultDepartments,
    initial_apps: companyData.initialApps,
    
    // System fields
    status: 'Active',
    setup_complete: true
  };

  // Insert company into database
  const { data: newCompany, error: companyError } = await supabaseAdmin
    .from('companies')
    .insert([dbCompanyData])
    .select()
    .single();

  if (companyError) {
    // console.error removed
    
    // Handle unique constraint violations
    if (companyError.code === '23505' && companyError.constraint === 'companies_company_name_unique') {
      return res.status(400).json({ 
        error: 'Company name already exists',
        details: 'Please choose a different company name'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to create company',
      details: companyError.message 
    });
  }

  // console.log removed

  // Create admin user account for the company
  let adminUser = null;
  let adminCreated = false;

  try {
    // Check if admin user already exists
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, first_name, last_name, role')
      .eq('email', companyData.adminUserEmail)
      .single();

    if (existingUser) {
      // console.log removed
      adminUser = existingUser;
      
      // Update role to Capacity Admin if needed
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
    } else {
      // console.log removed
      
      // Create new user account
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: companyData.adminUserEmail,
        password: 'ChangeMe123!', // Default password - should be changed
        email_confirm: true,
        user_metadata: {
          first_name: companyData.adminUserName.split(' ')[0] || '',
          last_name: companyData.adminUserName.split(' ').slice(1).join(' ') || '',
          role: 'Capacity Admin'  // This will be the company-specific admin role
        }
      });

      if (authError) {
        // console.error removed
        // Continue without admin user - can be created later via sync
      } else {
        // Create user profile
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert([{
            id: authData.user.id,
            email: companyData.adminUserEmail,
            first_name: companyData.adminUserName.split(' ')[0] || '',
            last_name: companyData.adminUserName.split(' ').slice(1).join(' ') || '',
            role: 'Capacity Admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError) {
          // console.error removed
          // Don't continue silently - this is critical
          throw new Error(`Profile creation failed: ${profileError.message}`);
        } else {
          // console.log removed
          adminUser = profileData;
          adminCreated = true;
          // console.log removed
        }
      }
    }

    // Link admin user to company - THIS IS CRITICAL!
    if (adminUser) {
      // console.log removed
      
      const { error: linkError } = await supabaseAdmin
        .from('company_users')
        .upsert([{
          company_id: newCompany.id,
          user_id: adminUser.id,
          role: 'Admin',
          status: 'Active',
          added_at: new Date().toISOString()
        }], { 
          onConflict: 'company_id,user_id',
          ignoreDuplicates: false 
        });

      if (linkError) {
        // console.error removed
        // This should not fail silently - it's a critical error
        return res.status(500).json({
          error: 'Company created but failed to link admin user',
          details: `Please run repair function for ${companyData.adminUserEmail}`,
          linkError: linkError.message
        });
      } else {
        // console.log removed
      }
    } else {
      // console.error removed
      // This is also critical - every company needs an admin user
      return res.status(500).json({
        error: 'Company created but no admin user available',
        details: `Admin user creation failed for ${companyData.adminUserEmail}`
      });
    }
  } catch (error) {
    // console.error removed
    // Continue with company creation even if admin user creation fails
  }

  // Create initial apps for the company
  const appInserts = companyData.initialApps.map(appId => ({
    company_id: newCompany.id,
    app_id: appId,
    app_name: getAppName(appId),
    enabled: true,
    configuration: {},
    deployed_at: new Date().toISOString()
  }));

  if (appInserts.length > 0) {
    // Insert into company_apps table
    const { error: appsError } = await supabaseAdmin
      .from('company_apps')
      .insert(appInserts);

    if (appsError) {
      // console.error removed
    } else {
      // console.log removed
    }

    // Also insert into apps table for the new system
    const appDetails = companyData.initialApps.map(appId => ({
      company_id: newCompany.id,
      app_name: getAppName(appId),
      app_type: appId,
      app_description: getAppDescription(appId),
      app_icon: getAppIcon(appId),
      app_color: getAppColor(appId),
      table_name: `${appId}_data`,
      status: 'active',
      schema_json: {},
      ui_config: {},
      permissions_config: {}
    }));

    const { error: appTableError } = await supabaseAdmin
      .from('apps')
      .insert(appDetails);

    if (appTableError) {
      // console.error removed
    } else {
      // console.log removed
    }
  }

  return res.status(201).json({
    success: true,
    message: `Company "${companyData.companyName}" created successfully`,
    company: newCompany,
    apps: appInserts,
    adminUser: adminUser ? {
      id: adminUser.id,
      email: adminUser.email,
      name: `${adminUser.first_name} ${adminUser.last_name}`.trim(),
      role: adminUser.role,
      created: adminCreated
    } : null
  });
}

// GET /api/admin/companies - List all companies
async function listCompanies(req, res) {
  // console.log removed

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
    // console.error removed
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

  // console.log removed

  return res.status(200).json({
    success: true,
    companies: transformedCompanies,
    count: transformedCompanies.length
  });
}

// GET /api/admin/companies?id=123 - Get specific company
async function getCompany(req, res, companyId) {
  // console.log removed

  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .select(`
      *,
      company_apps (
        app_id,
        app_name,
        enabled,
        configuration
      ),
      company_users (
        id,
        user_id,
        role,
        status,
        added_at
      )
    `)
    .eq('id', companyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({ error: 'Company not found' });
    }
    // console.error removed
    return res.status(500).json({ 
      error: 'Failed to fetch company',
      details: error.message 
    });
  }

  // Transform data for frontend
  const transformedCompany = {
    id: company.id,
    name: company.company_name,
    industry: company.industry,
    users: company.company_users.filter(user => user.status === 'Active').length,
    apps: company.company_apps.filter(app => app.enabled).map(app => app.app_name),
    
    // Include all company data
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
    updatedAt: company.updated_at,
    
    // Include related data
    companyApps: company.company_apps,
    companyUsers: company.company_users
  };

  // console.log removed

  return res.status(200).json({
    success: true,
    company: transformedCompany
  });
}

// Helper functions for app metadata
function getAppDescription(appId) {
  const descriptions = {
    'formulas': 'Chemical formula management system',
    'suppliers': 'Supplier relationship management', 
    'raw-materials': 'Raw material inventory management',
    'products': 'Product catalog management',
    'quality-control': 'Quality control and testing',
    'production': 'Production planning and tracking',
    'inventory': 'Inventory management system',
    'reports': 'Reporting and analytics dashboard'
  };
  return descriptions[appId] || 'Application management system';
}

function getAppIcon(appId) {
  const icons = {
    'formulas': 'Database',
    'suppliers': 'Building2',
    'raw-materials': 'FlaskConical', 
    'products': 'Table',
    'quality-control': 'Settings',
    'production': 'Zap',
    'inventory': 'Database',
    'reports': 'Table'
  };
  return icons[appId] || 'Database';
}

function getAppColor(appId) {
  const colors = {
    'formulas': '#10B981',
    'suppliers': '#3B82F6',
    'raw-materials': '#F59E0B',
    'products': '#8B5CF6',
    'quality-control': '#EF4444',
    'production': '#06B6D4',
    'inventory': '#84CC16',
    'reports': '#F97316'
  };
  return colors[appId] || '#6B7280';
}

// GET /api/admin/companies?id=123&action=get-apps - Get company apps
async function getCompanyApps(req, res, companyId) {
  // console.log removed

  const { data: apps, error } = await supabaseAdmin
    .from('company_apps')
    .select(`
      app_id,
      app_name,
      enabled,
      configuration
    `)
    .eq('company_id', companyId)
    .eq('enabled', true);

  if (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Failed to fetch company apps',
      details: error.message 
    });
  }

  // Transform data to match frontend expectations
  const transformedApps = (apps || []).map(app => ({
    id: app.app_id,
    appId: app.app_id,
    appName: app.app_name,
    appDescription: getAppDescription(app.app_id),
    appIcon: getAppIcon(app.app_id),
    appColor: getAppColor(app.app_id),
    status: app.enabled ? 'Active' : 'Inactive',
    recordCount: 0, // TODO: Get actual record count
    userCount: 0,   // TODO: Get actual user count
    enabled: app.enabled,
    configuration: app.configuration
  }));

  // console.log removed

  return res.status(200).json({
    success: true,
    apps: transformedApps
  });
}

// PUT /api/admin/companies?id=123 - Update company
async function updateCompany(req, res, companyId) {
  // console.log removed

  const updateData = req.body;

  // Validate that company exists first
  const { data: existingCompany, error: fetchError } = await supabaseAdmin
    .from('companies')
    .select('id, company_name')
    .eq('id', companyId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.status(500).json({ 
      error: 'Failed to verify company',
      details: fetchError.message 
    });
  }

  // Transform frontend data to database schema (only include provided fields)
  const dbUpdateData = {};
  
  // Map frontend field names to database field names
  const fieldMapping = {
    companyName: 'company_name',
    companySize: 'company_size',
    website: 'website',
    country: 'country',
    timezone: 'timezone',
    industry: 'industry',
    
    contactName: 'contact_name',
    contactEmail: 'contact_email',
    contactPhone: 'contact_phone',
    contactTitle: 'contact_title',
    
    databaseIsolation: 'database_isolation',
    dataRetention: 'data_retention',
    backupFrequency: 'backup_frequency',
    apiRateLimit: 'api_rate_limit',
    
    dataResidency: 'data_residency',
    complianceStandards: 'compliance_standards',
    ssoEnabled: 'sso_enabled',
    twoFactorRequired: 'two_factor_required',
    
    subscriptionTier: 'subscription_tier',
    billingContact: 'billing_contact',
    billingEmail: 'billing_email',
    paymentMethod: 'payment_method',
    
    adminUserName: 'admin_user_name',
    adminUserEmail: 'admin_user_email',
    defaultDepartments: 'default_departments',
    initialApps: 'initial_apps',
    
    status: 'status'
  };

  // Only include fields that are provided in the update
  Object.keys(updateData).forEach(key => {
    if (fieldMapping[key] && updateData[key] !== undefined) {
      dbUpdateData[fieldMapping[key]] = updateData[key];
    }
  });

  // Convert apiRateLimit to integer if provided
  if (dbUpdateData.api_rate_limit) {
    dbUpdateData.api_rate_limit = parseInt(dbUpdateData.api_rate_limit);
  }

  // Add updated_at timestamp
  dbUpdateData.updated_at = new Date().toISOString();

  const { data: updatedCompany, error: updateError } = await supabaseAdmin
    .from('companies')
    .update(dbUpdateData)
    .eq('id', companyId)
    .select()
    .single();

  if (updateError) {
    // console.error removed
    
    // Handle unique constraint violations
    if (updateError.code === '23505' && updateError.constraint === 'companies_company_name_unique') {
      return res.status(400).json({ 
        error: 'Company name already exists',
        details: 'Please choose a different company name'
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to update company',
      details: updateError.message 
    });
  }

  // console.log removed

  return res.status(200).json({
    success: true,
    message: `Company "${updatedCompany.company_name}" updated successfully`,
    company: updatedCompany
  });
}

// DELETE /api/admin/companies?id=123 - Delete company
async function deleteCompany(req, res, companyId) {
  // console.log removed

  // Validate that company exists first
  const { data: existingCompany, error: fetchError } = await supabaseAdmin
    .from('companies')
    .select('id, company_name, admin_user_email')
    .eq('id', companyId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return res.status(404).json({ error: 'Company not found' });
    }
    return res.status(500).json({ 
      error: 'Failed to verify company',
      details: fetchError.message 
    });
  }

  // console.log removed
  let deletedUsers = 0;

  try {
    // Step 1: Get all users associated with this company
    const { data: companyUsers, error: usersError } = await supabaseAdmin
      .from('company_users')
      .select('user_id')
      .eq('company_id', companyId);

    if (usersError) {
      // console.error removed
    } else if (companyUsers && companyUsers.length > 0) {
      // console.log removed
      
      // Step 2: Delete auth users (but not NSight admins)
      for (const companyUser of companyUsers) {
        try {
          // Check if user is NSight admin before deleting
          const { data: userProfile, error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .select('email, role')
            .eq('id', companyUser.user_id)
            .single();

          if (!profileError && userProfile && userProfile.role !== 'NSight Admin') {
            // console.log removed
            
            // Delete from auth
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(companyUser.user_id);
            if (authError) {
              // console.error removed
            }
            
            // Delete from user_profiles
            const { error: profileDeleteError } = await supabaseAdmin
              .from('user_profiles')
              .delete()
              .eq('id', companyUser.user_id);
            
            if (profileDeleteError) {
              // console.error removed
            } else {
              deletedUsers++;
            }
          } else {
            // console.log removed
          }
        } catch (error) {
          // console.error removed
        }
      }
    }

    // Step 3: Delete company_users entries
    const { error: companyUsersError } = await supabaseAdmin
      .from('company_users')
      .delete()
      .eq('company_id', companyId);

    if (companyUsersError) {
      // console.error removed
    } else {
      // console.log removed
    }

    // Step 4: Delete apps associated with this company
    const { error: appsError } = await supabaseAdmin
      .from('apps')
      .delete()
      .eq('company_id', companyId);

    if (appsError) {
      // console.error removed
    } else {
      // console.log removed
    }

    // Step 5: Delete company_apps entries
    const { error: companyAppsError } = await supabaseAdmin
      .from('company_apps')
      .delete()
      .eq('company_id', companyId);

    if (companyAppsError) {
      // console.error removed
    } else {
      // console.log removed
    }

    // Step 6: Delete tenant configuration if it exists
    const { error: tenantError } = await supabaseAdmin
      .from('tenant_configurations')
      .delete()
      .eq('company_id', companyId);

    if (tenantError) {
      // console.error removed
    } else {
      // console.log removed
    }

    // Step 7: Finally, delete the company record
    const { error: deleteError } = await supabaseAdmin
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (deleteError) {
      // console.error removed
      return res.status(500).json({ 
        error: 'Failed to delete company',
        details: deleteError.message 
      });
    }

    // console.log removed

    return res.status(200).json({
      success: true,
      message: `Company "${existingCompany.company_name}" deleted successfully`,
      deletedUsers: deletedUsers
    });

  } catch (error) {
    // console.error removed
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Helper function to get app display name from app ID
function getAppName(appId) {
  const appNames = {
    'formulas': 'Formulas Management',
    'raw-materials': 'Raw Materials',
    'suppliers': 'Suppliers',
    'analytics': 'Analytics',
    'compliance': 'Compliance',
    'quality': 'Quality Control'
  };
  return appNames[appId] || appId;
}

// POST /api/admin/companies?action=repair-user-links - Fix missing company-user links
async function repairUserLinks(req, res) {
  // console.log removed
  
  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('id, company_name, admin_user_email');
    
    if (companiesError) {
      throw companiesError;
    }
    
    let repairedCount = 0;
    const repairs = [];
    
    for (const company of companies) {
      if (!company.admin_user_email) continue;
      
      // Find user by email
      let { data: userProfile, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, first_name, last_name')
        .eq('email', company.admin_user_email)
        .single();
      
      if (userError || !userProfile) {
        // console.log removed
        
        // Check if user exists in auth but missing profile
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) {
          // console.error removed
          continue;
        }
        
        const authUser = users.find(user => user.email === company.admin_user_email);
        if (authUser) {
          // console.log removed
          
          // Create missing user profile
          const { data: newProfile, error: createError } = await supabaseAdmin
            .from('user_profiles')
            .insert({
              id: authUser.id,
              email: company.admin_user_email,
              first_name: authUser.user_metadata?.first_name || company.admin_user_email.split('@')[0],
              last_name: authUser.user_metadata?.last_name || '',
              role: 'Capacity Admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            // console.error removed
            continue;
          }
          
          // console.log removed
          userProfile = newProfile;
        } else {
          // console.log removed
          continue;
        }
      }
      
      // Check if company_users link exists
      const { data: existingLink, error: linkError } = await supabaseAdmin
        .from('company_users')
        .select('id')
        .eq('company_id', company.id)
        .eq('user_id', userProfile.id)
        .single();
      
      if (existingLink) {
        // console.log removed
        continue;
      }
      
      // Create missing link
      const { error: insertError } = await supabaseAdmin
        .from('company_users')
        .insert({
          company_id: company.id,
          user_id: userProfile.id,
          role: 'Admin',
          status: 'Active',
          added_at: new Date().toISOString()
        });
      
      if (insertError) {
        // console.error removed
      } else {
        // console.log removed
        repairedCount++;
        repairs.push({
          company: company.company_name,
          user: company.admin_user_email,
          userId: userProfile.id
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Repaired ${repairedCount} missing company-user links`,
      repairedCount,
      repairs
    });
    
  } catch (error) {
    // console.error removed
    return res.status(500).json({
      error: 'Failed to repair company-user links',
      details: error.message
    });
  }
}

// POST /api/admin/companies?action=fix-user-profile - Fix specific user profile by user ID
async function fixUserProfile(req, res) {
  // console.log removed
  
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({
        error: 'Either userId or email is required'
      });
    }
    
    // console.log removed
    
    let targetUserId = userId;
    let targetEmail = email;
    
    // If we have email but no userId, find the userId from auth
    if (email && !userId) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list auth users: ${listError.message}`);
      }
      
      const authUser = users.find(user => user.email === email);
      if (!authUser) {
        return res.status(404).json({
          error: `User with email ${email} not found in auth system`
        });
      }
      
      targetUserId = authUser.id;
      targetEmail = authUser.email;
    }
    
    // If we have userId but no email, get email from auth
    if (userId && !email) {
      const { data: authUser, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userError || !authUser.user) {
        return res.status(404).json({
          error: `User with ID ${userId} not found in auth system`
        });
      }
      
      targetEmail = authUser.user.email;
    }
    
    // console.log removed
    
    // Check if user profile already exists
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();
    
    if (existingProfile) {
      // console.log removed
      return res.status(200).json({
        success: true,
        message: 'User profile already exists',
        profile: existingProfile
      });
    }
    
    // Get user details from auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);
    if (authError || !authUser.user) {
      throw new Error(`Failed to get user from auth: ${authError?.message || 'User not found'}`);
    }
    
    // Create the missing user profile
    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: targetUserId,
        email: targetEmail,
        first_name: authUser.user.user_metadata?.first_name || targetEmail.split('@')[0],
        last_name: authUser.user.user_metadata?.last_name || '',
        role: authUser.user.user_metadata?.role || 'Capacity Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      throw new Error(`Failed to create user profile: ${createError.message}`);
    }
    
    // console.log removed
    
    // Try to auto-link to company if this user is a company admin
    try {
      const response = await fetch('http://localhost:3001/api/admin/companies');
      if (response.ok) {
        const { companies } = await response.json();
        const matchingCompany = companies.find(company => 
          company.adminUserEmail === targetEmail
        );
        
        if (matchingCompany) {
          // console.log removed
          
          const { error: linkError } = await supabaseAdmin
            .from('company_users')
            .upsert({
              company_id: matchingCompany.id,
              user_id: targetUserId,
              role: 'Admin',
              status: 'Active',
              added_at: new Date().toISOString()
            }, {
              onConflict: 'company_id,user_id'
            });
          
          if (!linkError) {
            // console.log removed
          }
        }
      }
    } catch (linkingError) {
      // console.log removed
    }
    
    return res.status(200).json({
      success: true,
      message: 'User profile created and linked successfully',
      profile: newProfile
    });
    
  } catch (error) {
    // console.error removed
    return res.status(500).json({
      error: 'Failed to fix user profile',
      details: error.message
    });
  }
}

   