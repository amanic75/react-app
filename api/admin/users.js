import { createClient } from '@supabase/supabase-js';

// Initialize Supabase clients
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

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
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
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');

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
    const { action } = req.query;
    
    switch (action) {
      case 'create':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for create action' });
        }
        return await createUser(req, res);
      
      case 'update':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for update action' });
        }
        return await updateUser(req, res);
      
      case 'change-password':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed for change-password action' });
        }
        return await changePassword(req, res);
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: ['create', 'update', 'change-password']
        });
    }

  } catch (error) {
    console.error('❌ Users API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// POST /api/admin/users?action=create - Create new user
async function createUser(req, res) {
  const { email, password, userData } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  console.log('🔧 Creating user with admin client:', email);
  console.log('📋 User data being processed:', {
    email,
    first_name: userData?.first_name,
    last_name: userData?.last_name,
    role: userData?.role,
    department: userData?.department
  });

  // Create user using admin client (doesn't affect current session)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      department: userData?.department || '',
      role: userData?.role || 'Employee'
    },
    email_confirm: true // Auto-confirm email
  });

  if (authError) {
    console.error('❌ Auth user creation failed:', authError);
    return res.status(400).json({ error: authError.message });
  }

  console.log('✅ Auth user created:', authData.user.id);

  // Create user profile in database
  const profileData = {
    id: authData.user.id,
    email: email,
    first_name: userData?.first_name || '',
    last_name: userData?.last_name || '',
    role: userData?.role || 'Employee',
    department: userData?.department || '',
    app_access: userData?.app_access || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('📝 Attempting to insert profile data:', profileData);
  
  // Use upsert to handle cases where profile might already exist
  const { data: insertedProfile, error: profileError } = await supabaseAdmin
    .from('user_profiles')
    .upsert([profileData], { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (profileError) {
    console.error('❌ Profile creation failed:', profileError);
    console.error('❌ Profile error details:', {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code
    });
    
    // Try to get the existing profile to see what's there
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (existingProfile) {
      console.log('📋 Existing profile found:', existingProfile);
      console.log('⚠️ Using existing profile - you may need to update the role manually');
      
      // If profile exists but has wrong role, try to update it
      if (existingProfile.role !== (userData?.role || 'Employee')) {
        console.log('🔧 Updating existing profile role from', existingProfile.role, 'to', userData?.role || 'Employee');
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
          .from('user_profiles')
          .update({ 
            role: userData?.role || 'Employee',
            app_access: userData?.app_access || [],
            updated_at: new Date().toISOString() 
          })
          .eq('id', authData.user.id)
          .select()
          .single();
        
        if (updateError) {
          console.error('❌ Failed to update profile role:', updateError);
          return res.status(500).json({ 
            error: 'User created but failed to update profile role',
            details: updateError.message 
          });
        } else {
          console.log('✅ Profile role updated successfully:', updatedProfile);
          return res.status(200).json({
            success: true,
            message: `User created successfully with updated role: ${email}`,
            user: {
              id: authData.user.id,
              email: authData.user.email,
              role: updatedProfile.role,
              ...userData
            }
          });
        }
      } else {
        // Profile exists with correct role, return success
        console.log('✅ Profile exists with correct role');
        return res.status(200).json({
          success: true,
          message: `User created successfully: ${email}`,
          user: {
            id: authData.user.id,
            email: authData.user.email,
            role: existingProfile.role,
            ...userData
          }
        });
      }
    } else {
      console.error('❌ Could not fetch existing profile:', fetchError);
      return res.status(500).json({ 
        error: 'User created but profile creation failed',
        details: profileError.message 
      });
    }
  } else {
    console.log('✅ User profile created successfully:', insertedProfile);
  }

  return res.status(200).json({
    success: true,
    message: `User created successfully: ${email}`,
    user: {
      id: authData.user.id,
      email: authData.user.email,
      ...userData
    }
  });
}

// POST /api/admin/users?action=update - Update user profile
async function updateUser(req, res) {
  const { userId, updates } = req.body;

  // Validate required fields
  if (!userId || !updates) {
    return res.status(400).json({ error: 'userId and updates are required' });
  }

  console.log('🔄 Updating user profile via API:', userId, updates);

  try {
    // Use upsert to create the profile if it doesn't exist, or update if it does
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        email: updates.email,
        first_name: updates.first_name,
        last_name: updates.last_name,
        role: updates.role,
        department: updates.department,
        app_access: updates.app_access,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString() // This will be ignored on update
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Profile upsert error:', error);
      return res.status(500).json({ 
        error: 'Failed to update user profile',
        details: error.message 
      });
    }

    console.log('✅ User profile updated successfully:', data);
    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: data
    });

  } catch (error) {
    console.error('❌ Update user error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// POST /api/admin/users?action=change-password - Change user password
async function changePassword(req, res) {
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
} 