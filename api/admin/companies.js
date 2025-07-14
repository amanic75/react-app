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
    const { id } = req.query;
    
    if (id) {
      // Operations on specific company: /api/admin/companies?id=123
      switch (req.method) {
        case 'GET':
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
          return await createCompany(req, res);
        default:
          return res.status(405).json({ error: 'Method not allowed' });
      }
    }

  } catch (error) {
    console.error('❌ Companies API error:', error);
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

  console.log('🏢 Creating new company:', companyData.companyName);

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
    console.error('❌ Company creation failed:', companyError);
    
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

  console.log('✅ Company created successfully:', newCompany.id);

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
    const { error: appsError } = await supabaseAdmin
      .from('company_apps')
      .insert(appInserts);

    if (appsError) {
      console.error('⚠️ Failed to create initial apps:', appsError);
    } else {
      console.log('✅ Initial apps created for company:', companyData.initialApps);
    }
  }

  return res.status(201).json({
    success: true,
    message: `Company "${companyData.companyName}" created successfully`,
    company: newCompany,
    apps: appInserts
  });
}

// GET /api/admin/companies - List all companies
async function listCompanies(req, res) {
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
}

// GET /api/admin/companies?id=123 - Get specific company
async function getCompany(req, res, companyId) {
  console.log('🔍 Fetching company:', companyId);

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
    console.error('❌ Failed to fetch company:', error);
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

  console.log('✅ Company fetched successfully');

  return res.status(200).json({
    success: true,
    company: transformedCompany
  });
}

// PUT /api/admin/companies?id=123 - Update company
async function updateCompany(req, res, companyId) {
  console.log('📝 Updating company:', companyId);

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
    console.error('❌ Company update failed:', updateError);
    
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

  console.log('✅ Company updated successfully');

  return res.status(200).json({
    success: true,
    message: `Company "${updatedCompany.company_name}" updated successfully`,
    company: updatedCompany
  });
}

// DELETE /api/admin/companies?id=123 - Delete company
async function deleteCompany(req, res, companyId) {
  console.log('🗑️ Deleting company:', companyId);

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

  // Delete the company (CASCADE will handle related records)
  const { error: deleteError } = await supabaseAdmin
    .from('companies')
    .delete()
    .eq('id', companyId);

  if (deleteError) {
    console.error('❌ Company deletion failed:', deleteError);
    return res.status(500).json({ 
      error: 'Failed to delete company',
      details: deleteError.message 
    });
  }

  console.log('✅ Company deleted successfully:', existingCompany.company_name);

  return res.status(200).json({
    success: true,
    message: `Company "${existingCompany.company_name}" deleted successfully`
  });
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