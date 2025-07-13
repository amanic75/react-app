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
            // Return success since user was created and profile was updated
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

  } catch (error) {
    console.error('❌ Create user API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 