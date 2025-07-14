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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // TODO: Verify admin user permissions (for now, allowing all authenticated users)
    // In production, you'd want to verify the user has NSight Admin role

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
      // created_by will be set when we have proper auth
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
        // Don't fail the whole operation, just log the error
      } else {
        console.log('✅ Initial apps created for company:', companyData.initialApps);
      }
    }

    // TODO: Create admin user account for the company
    // This would involve:
    // 1. Creating user in auth system
    // 2. Adding user to company_users table
    // 3. Sending welcome email

    // Return the created company
    return res.status(201).json({
      success: true,
      message: `Company "${companyData.companyName}" created successfully`,
      company: newCompany,
      apps: appInserts
    });

  } catch (error) {
    console.error('❌ Company creation API error:', error);
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