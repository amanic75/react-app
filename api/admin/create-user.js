import { createClient } from '@supabase/supabase-js';

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
    const { email, password, userData } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!serviceRoleKey 
      });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Create admin Supabase client with service role key
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔧 Creating user with admin client:', email);

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
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || '',
          role: userData?.role || 'Employee',
          department: userData?.department || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError);
      // User was created in auth but profile creation failed
      // This is not critical as the profile will be auto-created when they log in
      console.log('⚠️ User created without profile - will be auto-created on login');
    } else {
      console.log('✅ User profile created:', profileData.id);
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

  } catch (error) {
    console.error('❌ Create user API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 