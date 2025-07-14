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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract company ID from query parameters
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Company ID is required' });
    }

    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // TODO: Verify admin user permissions (for now, allowing all authenticated users)
    // In production, you'd want to verify the user has NSight Admin role

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

  } catch (error) {
    console.error('❌ Company API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// GET /api/admin/companies/[id] - Get specific company
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

// PUT /api/admin/companies/[id] - Update company
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

// DELETE /api/admin/companies/[id] - Delete company
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