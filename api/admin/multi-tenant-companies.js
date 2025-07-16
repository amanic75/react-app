import multiTenantDB from '../../src/lib/multiTenantDatabase.js';

// Multi-tenant company management API
// This replaces the existing companies.js with full tenant isolation

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
    const { method, query } = req;
    
    // Route based on method and query parameters
    switch (method) {
      case 'GET':
        if (query.id) {
          return await getCompany(req, res, query.id);
        }
        return await listCompanies(req, res);
      
      case 'POST':
        return await createCompanyWithTenant(req, res);
      
      case 'PUT':
        if (query.id) {
          return await updateCompany(req, res, query.id);
        }
        return res.status(400).json({ error: 'Company ID required for update' });
      
      case 'DELETE':
        if (query.id) {
          return await deleteCompany(req, res, query.id);
        }
        return res.status(400).json({ error: 'Company ID required for deletion' });
      
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('❌ Multi-tenant companies API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Create company with isolated tenant database
async function createCompanyWithTenant(req, res) {
  const companyData = req.body;

  console.log('🏗️ Creating multi-tenant company:', companyData.companyName);

  try {
    // Validate required fields
    if (!companyData.companyName || !companyData.adminUserEmail || !companyData.adminUserName) {
      return res.status(400).json({ 
        error: 'Missing required fields: companyName, adminUserEmail, adminUserName' 
      });
    }

    // Step 1: Create company record in master database
    const newCompany = await createCompanyRecord(companyData);
    console.log('✅ Company record created:', newCompany.id);

    // Step 2: Create isolated tenant database
    const tenantConfig = await multiTenantDB.createTenantDatabase(
      newCompany.id,
      companyData.companyName
    );
    console.log('✅ Tenant database created:', tenantConfig.schemaName);

    // Step 3: Create company admin account
    const adminAccount = await multiTenantDB.createCompanyAdmin(
      newCompany.id,
      companyData.adminUserEmail,
      companyData.adminUserName,
      companyData.companyName
    );
    console.log('✅ Admin account created:', adminAccount.email);

    // Step 4: Deploy initial apps to tenant database
    const initialApps = companyData.initialApps || ['formulas', 'suppliers', 'raw-materials'];
    await multiTenantDB.deployInitialApps(newCompany.id, initialApps);
    console.log('✅ Initial apps deployed:', initialApps);

    // Step 5: Return success response
    return res.status(201).json({
      success: true,
      message: `Multi-tenant company "${companyData.companyName}" created successfully`,
      company: {
        id: newCompany.id,
        name: newCompany.company_name,
        adminEmail: adminAccount.email,
        adminPassword: adminAccount.defaultPassword,
        tenantSchema: tenantConfig.schemaName,
        apps: initialApps
      },
      adminAccount: {
        email: adminAccount.email,
        defaultPassword: adminAccount.defaultPassword,
        instructions: 'Use these credentials to log in to the company dashboard. Change the password immediately after first login.'
      },
      tenantInfo: {
        schemaName: tenantConfig.schemaName,
        status: tenantConfig.status,
        appsDeployed: initialApps.length
      }
    });

  } catch (error) {
    console.error('❌ Failed to create multi-tenant company:', error);
    
    // TODO: Implement cleanup logic here
    // - Remove company record if tenant creation fails
    // - Remove tenant database if admin creation fails
    // - etc.
    
    return res.status(500).json({
      error: 'Failed to create multi-tenant company',
      details: error.message
    });
  }
}

// Create company record in master database
async function createCompanyRecord(companyData) {
  const dbCompanyData = {
    company_name: companyData.companyName,
    industry: companyData.industry || 'Technology',
    company_size: companyData.companySize || '1-50',
    website: companyData.website || null,
    country: companyData.country || 'United States',
    timezone: companyData.timezone || 'America/New_York',
    
    contact_name: companyData.contactName || companyData.adminUserName,
    contact_email: companyData.contactEmail || companyData.adminUserEmail,
    contact_phone: companyData.contactPhone || null,
    contact_title: companyData.contactTitle || 'Admin',
    
    database_isolation: 'schema', // Always use schema isolation for multi-tenant
    data_retention: companyData.dataRetention || '7-years',
    backup_frequency: companyData.backupFrequency || 'daily',
    api_rate_limit: parseInt(companyData.apiRateLimit) || 1000,
    
    data_residency: companyData.dataResidency || 'us-east',
    compliance_standards: companyData.complianceStandards || ['ISO9001'],
    sso_enabled: companyData.ssoEnabled || false,
    two_factor_required: companyData.twoFactorRequired || false,
    
    subscription_tier: companyData.subscriptionTier || 'professional',
    billing_contact: companyData.billingContact || companyData.adminUserName,
    billing_email: companyData.billingEmail || companyData.adminUserEmail,
    payment_method: companyData.paymentMethod || 'invoice',
    
    admin_user_name: companyData.adminUserName,
    admin_user_email: companyData.adminUserEmail,
    default_departments: companyData.defaultDepartments || ['Production', 'Operations'],
    initial_apps: companyData.initialApps || ['formulas', 'suppliers', 'raw-materials'],
    
    status: 'Active',
    setup_complete: true
  };

  // Insert into master database
  const { data: newCompany, error } = await multiTenantDB.masterDb
    .from('companies')
    .insert([dbCompanyData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company record: ${error.message}`);
  }

  return newCompany;
}

// List all companies with tenant information
async function listCompanies(req, res) {
  console.log('📋 Fetching multi-tenant companies list');

  try {
    const { data: companies, error } = await multiTenantDB.masterDb
      .from('company_tenant_info')
      .select('*')
      .order('company_created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }

    // Calculate user counts and apps for all companies
    const transformedCompanies = await Promise.all(companies.map(async (company) => {
      let userCount = 0;
      let apps = [];
      
      if (company.schema_name) {
        // For isolated tenant databases - get from tenant
        try {
          const tenantDb = await multiTenantDB.getTenantConnection(company.company_id);
          
          const { data: users, error: usersError } = await tenantDb
            .from('user_profiles')
            .select('id')
            .eq('company_id', company.company_id);
          
          const { data: tenantApps, error: appsError } = await tenantDb
            .from('apps')
            .select('*')
            .eq('status', 'active');
          
          userCount = users ? users.length : 0;
          apps = tenantApps || [];
          
        } catch (tenantError) {
          console.error(`⚠️ Failed to fetch tenant data for ${company.company_name}:`, tenantError);
          userCount = 0;
          apps = [];
        }
             } else {
         // For shared legacy databases - get from master database using company_users junction table
         try {
           // Get users via company_users junction table
           const { data: companyUsers, error: usersError } = await multiTenantDB.masterDb
             .from('company_users')
             .select('user_id')
             .eq('company_id', company.company_id)
             .eq('status', 'Active');
           
           const { data: sharedApps, error: appsError } = await multiTenantDB.masterDb
             .from('apps')
             .select('*')
             .eq('company_id', company.company_id)
             .eq('status', 'active');
           
           userCount = companyUsers ? companyUsers.length : 0;
           apps = sharedApps || [];
           
         } catch (sharedError) {
           console.error(`⚠️ Failed to fetch shared data for ${company.company_name}:`, sharedError);
           userCount = 0;
           apps = [];
         }
       }
      
      return {
        id: company.company_id,
        name: company.company_name,
        adminEmail: company.admin_user_email,
        status: company.company_status,
        createdAt: company.company_created_at,
        
        // Tenant information
        tenantSchema: company.schema_name,
        tenantStatus: company.tenant_status,
        tenantCreatedAt: company.tenant_created_at,
        
        // Computed fields
        hasIsolatedDatabase: !!company.schema_name,
        databaseType: company.schema_name ? 'Isolated Schema' : 'Shared (Legacy)',
        
        // Real data from database
        users: userCount,
        apps: apps
      };
    }));

    console.log(`✅ Found ${transformedCompanies.length} multi-tenant companies`);

    return res.status(200).json({
      success: true,
      companies: transformedCompanies
    });

  } catch (error) {
    console.error('❌ Failed to fetch companies:', error);
    return res.status(500).json({
      error: 'Failed to fetch companies',
      details: error.message
    });
  }
}

// Get specific company with tenant details
async function getCompany(req, res, companyId) {
  console.log('🔍 Fetching multi-tenant company:', companyId);

  try {
    // Get company and tenant info
    const { data: company, error } = await multiTenantDB.masterDb
      .from('company_tenant_info')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' });
      }
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    // Get tenant-specific data if tenant exists
    let tenantData = null;
    if (company.schema_name) {
      // For isolated tenant databases
      try {
        const tenantDb = await multiTenantDB.getTenantConnection(companyId);
        
        // Get apps from tenant database
        const { data: apps, error: appsError } = await tenantDb
          .from('apps')
          .select('*')
          .eq('status', 'active');

        // Get user count from tenant database
        const { data: users, error: usersError } = await tenantDb
          .from('user_profiles')
          .select('id')
          .eq('company_id', companyId);

        tenantData = {
          apps: apps || [],
          userCount: users ? users.length : 0,
          hasError: !!(appsError || usersError)
        };

      } catch (tenantError) {
        console.error('⚠️ Failed to fetch tenant data:', tenantError);
        tenantData = {
          apps: [],
          userCount: 0,
          hasError: true,
          error: tenantError.message
        };
      }
    } else {
      // For shared legacy databases - use company_users junction table
      try {
        // Get users via company_users junction table
        const { data: companyUsers, error: usersError } = await multiTenantDB.masterDb
          .from('company_users')
          .select('user_id')
          .eq('company_id', companyId)
          .eq('status', 'Active');
        
        // Get apps from shared database
        const { data: sharedApps, error: appsError } = await multiTenantDB.masterDb
          .from('apps')
          .select('*')
          .eq('company_id', companyId)
          .eq('status', 'active');
        
        tenantData = {
          apps: sharedApps || [],
          userCount: companyUsers ? companyUsers.length : 0,
          hasError: !!(appsError || usersError)
        };

      } catch (sharedError) {
        console.error('⚠️ Failed to fetch shared data:', sharedError);
        tenantData = {
          apps: [],
          userCount: 0,
          hasError: true,
          error: sharedError.message
        };
      }
    }

    const transformedCompany = {
      id: company.company_id,
      name: company.company_name,
      adminEmail: company.admin_user_email,
      status: company.company_status,
      createdAt: company.company_created_at,
      
      // Tenant information
      tenantSchema: company.schema_name,
      tenantStatus: company.tenant_status,
      tenantCreatedAt: company.tenant_created_at,
      
      // Tenant data
      apps: tenantData?.apps || [],
      users: tenantData?.userCount || 0,
      
      // Computed fields
      hasIsolatedDatabase: !!company.schema_name,
      databaseType: company.schema_name ? 'Isolated Schema' : 'Shared (Legacy)',
      tenantHealthy: tenantData ? !tenantData.hasError : false
    };

    console.log('✅ Company fetched successfully');

    return res.status(200).json({
      success: true,
      company: transformedCompany
    });

  } catch (error) {
    console.error('❌ Failed to fetch company:', error);
    return res.status(500).json({
      error: 'Failed to fetch company',
      details: error.message
    });
  }
}

// Update company (master database only)
async function updateCompany(req, res, companyId) {
  console.log('📝 Updating multi-tenant company:', companyId);

  try {
    const updateData = req.body;

    // Validate company exists
    const { data: existingCompany, error: fetchError } = await multiTenantDB.masterDb
      .from('companies')
      .select('id, company_name')
      .eq('id', companyId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Company not found' });
      }
      throw new Error(`Failed to verify company: ${fetchError.message}`);
    }

    // Transform update data
    const dbUpdateData = {};
    const fieldMapping = {
      companyName: 'company_name',
      industry: 'industry',
      companySize: 'company_size',
      website: 'website',
      country: 'country',
      timezone: 'timezone',
      contactName: 'contact_name',
      contactEmail: 'contact_email',
      contactPhone: 'contact_phone',
      contactTitle: 'contact_title',
      subscriptionTier: 'subscription_tier',
      status: 'status'
    };

    Object.keys(updateData).forEach(key => {
      if (fieldMapping[key]) {
        dbUpdateData[fieldMapping[key]] = updateData[key];
      }
    });

    // Update company record
    const { data: updatedCompany, error: updateError } = await multiTenantDB.masterDb
      .from('companies')
      .update(dbUpdateData)
      .eq('id', companyId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update company: ${updateError.message}`);
    }

    console.log('✅ Company updated successfully');

    return res.status(200).json({
      success: true,
      message: `Company "${updatedCompany.company_name}" updated successfully`,
      company: updatedCompany
    });

  } catch (error) {
    console.error('❌ Failed to update company:', error);
    return res.status(500).json({
      error: 'Failed to update company',
      details: error.message
    });
  }
}

// Delete company and its tenant database
async function deleteCompany(req, res, companyId) {
  console.log('🗑️ Deleting multi-tenant company:', companyId);

  try {
    // Get tenant info first
    const tenantConfig = await multiTenantDB.getTenantConfig(companyId);
    
    if (tenantConfig) {
      // Drop tenant schema
      await multiTenantDB.masterDb.rpc('drop_tenant_schema', {
        schema_name: tenantConfig.schema_name
      });
      
      // Remove tenant configuration
      await multiTenantDB.masterDb
        .from('tenant_configurations')
        .delete()
        .eq('company_id', companyId);
        
      console.log('✅ Tenant database deleted');
    }

    // Delete company record
    const { error } = await multiTenantDB.masterDb
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }

    console.log('✅ Company deleted successfully');

    return res.status(200).json({
      success: true,
      message: 'Company and its isolated database deleted successfully'
    });

  } catch (error) {
    console.error('❌ Failed to delete company:', error);
    return res.status(500).json({
      error: 'Failed to delete company',
      details: error.message
    });
  }
} 