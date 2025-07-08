import dotenv from 'dotenv';

// Load environment variables FIRST, before any other imports
dotenv.config({ path: '.env.local' });

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Debug environment variables
console.log('🔧 Environment variables loaded:');
console.log('  VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
console.log('  SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('  VITE_SUPABASE_ANON_KEY:', !!process.env.VITE_SUPABASE_ANON_KEY);

// Import and handle API routes
app.post('/api/admin/change-password', async (req, res) => {
  try {
    // Import the handler function (this will now have access to env vars)
    const { default: handler } = await import('../api/admin/change-password.js');
    
    // Create a mock response object that matches Vercel's API format
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          res.status(code).json(data);
        }
      }),
      setHeader: (name, value) => {
        res.setHeader(name, value);
      }
    };

    // Call the handler with request and mock response
    await handler(req, mockRes);
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Debug endpoint to check user profile
app.post('/api/debug/check-profile', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { adminToken } = req.body;

    if (!adminToken) {
      return res.status(400).json({ error: 'adminToken required' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(adminToken);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', details: authError?.message });
    }

    console.log('🔍 Token validated for user:', user.email);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('🔍 Profile query result:', { profile, profileError });

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profile,
      profileError: profileError?.message,
      hasProfile: !!profile,
      role: profile?.role,
      isCapacityAdmin: profile?.role === 'Capacity Admin'
    });

  } catch (error) {
    console.error('❌ Debug Error:', error);
    res.status(500).json({ error: 'Debug error', details: error.message });
  }
});

// Fix endpoint to create/update admin profile
app.post('/api/debug/fix-admin-profile', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { adminToken } = req.body;

    if (!adminToken) {
      return res.status(400).json({ error: 'adminToken required' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(adminToken);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', details: authError?.message });
    }

    console.log('🔧 Fixing profile for user:', user.email);

    // First, delete any existing profiles for this user (clean up duplicates)
    const { error: deleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      console.error('Error deleting existing profiles:', deleteError);
    } else {
      console.log('✅ Cleaned up existing profiles');
    }

    // Create a new admin profile
    const newProfile = {
      id: user.id,
      email: user.email,
      first_name: user.email.includes('admin') ? 'Admin' : user.email.split('@')[0],
      last_name: 'User',
      role: 'Capacity Admin', // Force admin role
      department: 'Administration',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: profile, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating profile:', insertError);
      return res.status(500).json({ error: 'Failed to create profile', details: insertError.message });
    }

    console.log('✅ Admin profile created:', profile);

    return res.json({
      success: true,
      message: 'Admin profile created successfully',
      profile: profile,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Fix Error:', error);
    res.status(500).json({ error: 'Fix error', details: error.message });
  }
});

// Super fix endpoint to comprehensively check and fix profile issues
app.post('/api/debug/super-fix-profile', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { adminToken } = req.body;

    if (!adminToken) {
      return res.status(400).json({ error: 'adminToken required' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(adminToken);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token', details: authError?.message });
    }

    console.log('🔧 Super-fixing profile for user:', user.email, 'ID:', user.id);

    // First, use admin client to see ALL profiles for this user (bypass RLS)
    const { data: allProfiles, error: listError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id);

    console.log('🔍 All profiles found:', allProfiles);
    console.log('🔍 List error:', listError);

    // Delete ALL existing profiles for this user
    const { error: deleteAllError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', user.id);

    if (deleteAllError) {
      console.error('Error deleting all profiles:', deleteAllError);
    } else {
      console.log('✅ Deleted all existing profiles');
    }

    // Create ONE new profile using admin client
    const newProfile = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || 'Admin',
      last_name: user.user_metadata?.last_name || 'Test',
      role: 'Capacity Admin',
      department: user.user_metadata?.department || 'Administration',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newProfileData, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating new profile:', insertError);
      return res.status(500).json({ 
        error: 'Failed to create profile', 
        details: insertError.message,
        allProfiles: allProfiles 
      });
    }

    console.log('✅ New profile created:', newProfileData);

    // Verify it worked - query again
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('🔍 Verification result:', verifyProfile);
    console.log('🔍 Verification error:', verifyError);

    return res.json({
      success: true,
      message: 'Profile super-fixed successfully',
      originalProfiles: allProfiles,
      newProfile: newProfileData,
      verification: verifyProfile,
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Super Fix Error:', error);
    res.status(500).json({ error: 'Super fix error', details: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Development API server is running',
    timestamp: new Date().toISOString(),
    env: {
      VITE_SUPABASE_URL: !!process.env.VITE_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      VITE_SUPABASE_ANON_KEY: !!process.env.VITE_SUPABASE_ANON_KEY
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`🔗 API endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/admin/change-password`);
  console.log(`   POST http://localhost:${PORT}/api/debug/check-profile`);
  console.log(`   POST http://localhost:${PORT}/api/debug/fix-admin-profile`);
  console.log(`   POST http://localhost:${PORT}/api/debug/super-fix-profile`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 Development API server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Development API server shutting down...');
  process.exit(0);
}); 