import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables:', {
    SUPABASE_URL: !!SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY
  });
}

// Create admin client with service role key (server-side only)
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create regular client to verify the requesting user
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Password validation helper
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return 'Password is required and must be a string';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (password.length > 72) {
    return 'Password must be less than 72 characters long';
  }
  return null;
};

// Email validation helper
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required and must be a string';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

export default async function handler(req, res) {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const { targetEmail, newPassword, adminToken } = req.body;

    // Validate required fields
    if (!targetEmail || !newPassword || !adminToken) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['targetEmail', 'newPassword', 'adminToken']
      });
    }

    // Validate email format
    const emailError = validateEmail(targetEmail);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    // Validate password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    // Check environment variables
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Server configuration error: Missing environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error. Please contact administrator.' 
      });
    }

    // Verify the admin user's session token
    console.log('🔍 Verifying admin token...');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(adminToken);
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return res.status(401).json({ 
        error: 'Invalid or expired admin token',
        details: 'Please log in again'
      });
    }

    if (!adminUser) {
      console.error('❌ No admin user found from token');
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    console.log('✅ Admin user verified:', adminUser.email, 'ID:', adminUser.id);

    // Get admin user's profile to check role - use admin client to bypass RLS
    console.log('🔍 Fetching admin profile from database...');
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, email, first_name, last_name')
      .eq('id', adminUser.id)
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      console.error('❌ Profile error code:', profileError.code);
      console.error('❌ Profile error details:', profileError.details);
      return res.status(403).json({ 
        error: 'Unable to verify admin permissions',
        details: 'User profile not found',
        debugInfo: {
          errorCode: profileError.code,
          errorMessage: profileError.message
        }
      });
    }

    if (!adminProfile) {
      console.error('❌ Admin profile is null/undefined');
      return res.status(403).json({ error: 'Admin profile not found' });
    }

    console.log('✅ Admin profile found:', adminProfile);

    // Check if user has Capacity Admin role
    if (adminProfile.role !== 'Capacity Admin') {
      console.log(`❌ Unauthorized password change attempt by ${adminUser.email} (role: ${adminProfile.role})`);
      return res.status(403).json({ 
        error: 'Insufficient permissions. Only Capacity Admin can change passwords.',
        userRole: adminProfile.role,
        requiredRole: 'Capacity Admin'
      });
    }

    console.log('✅ Admin permissions verified - proceeding with password change');

    // If admin is changing their own password, use regular method
    if (adminUser.email === targetEmail) {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Self password update error:', updateError.message);
        return res.status(400).json({ 
          error: updateError.message || 'Failed to update your password'
        });
      }

      console.log(`Admin ${adminUser.email} changed their own password`);
      return res.status(200).json({ 
        success: true, 
        message: `Password successfully changed for ${targetEmail}`,
        type: 'self-update'
      });
    }

    // For other users, use admin API to find and update the user
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError.message);
      return res.status(500).json({ 
        error: 'Failed to find target user',
        details: 'Database query error'
      });
    }

    const targetUser = users.find(user => user.email === targetEmail);
    
    if (!targetUser) {
      console.log(`Target user not found: ${targetEmail}`);
      return res.status(404).json({ 
        error: 'Target user not found',
        targetEmail: targetEmail
      });
    }

    // Update the target user's password using admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError.message);
      return res.status(400).json({ 
        error: updateError.message || 'Failed to update target user password'
      });
    }

    // Log the password change for audit purposes
    console.log(`Password changed by admin ${adminUser.email} for user ${targetEmail} at ${new Date().toISOString()}`);

    return res.status(200).json({ 
      success: true, 
      message: `Password successfully changed for ${targetEmail}`,
      type: 'admin-update',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Unexpected API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
} 