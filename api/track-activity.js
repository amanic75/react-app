import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for full access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Database-based activity tracking (works on serverless platforms)
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, userEmail, userName, userRole, page, timestamp } = req.body;
    
    // Support both userId (old format) and userEmail (new format)
    const trackingId = userId || userEmail;
    
    if (!trackingId) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    // Create user_activity table if it doesn't exist (for first run)
    await ensureActivityTableExists();

    // Update user activity in database with upsert
    const activityData = {
      user_email: userEmail || trackingId,
      user_name: userName || 'Unknown User',
      user_role: userRole || 'Employee',
      page: page || 'unknown',
      last_seen: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const { data: upsertData, error: upsertError } = await supabase
      .from('user_activity')
      .upsert(activityData, { 
        onConflict: 'user_email',
        ignoreDuplicates: false 
      })
      .select();

    if (upsertError) {
      // console.error removed
      // Fallback: try insert instead
      const { data: insertData, error: insertError } = await supabase
        .from('user_activity')
        .insert(activityData)
        .select();
      
      if (insertError) {
        // console.error removed
      }
    }

    // Clean up old activity (remove users inactive for more than 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - (2 * 60 * 1000)).toISOString();
    const { error: cleanupError } = await supabase
      .from('user_activity')
      .delete()
      .lt('last_seen', twoMinutesAgo);

    if (cleanupError) {
      // console.error removed
    }

    // Get current active user count
    const { data: activeUsers, error: countError } = await supabase
      .from('user_activity')
      .select('user_email')
      .gte('last_seen', twoMinutesAgo);

    const activeUserCount = activeUsers?.length || 0;

    // Try to update user profile updated_at timestamp as well (if we have userEmail)
    let dbUpdateSuccess = false;
    if (userEmail) {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .update({ updated_at: new Date().toISOString() })
          .eq('email', userEmail)
          .select();
          
        if (error) {
          // Database update error
        } else {
          dbUpdateSuccess = true;
        }
      } catch (dbError) {
        // Database update failed
      }
    }

    res.status(200).json({ 
      success: true,
      activeUsers: activeUserCount,
      message: 'Activity tracked'
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to track activity',
      details: error.message
    });
  }
}

// Ensure the user_activity table exists
async function ensureActivityTableExists() {
  try {
    // Try to query the table first
    const { data, error } = await supabase
      .from('user_activity')
      .select('user_email')
      .limit(1);

    // If table doesn't exist, this will return a specific error
    if (error && error.message.includes('relation "user_activity" does not exist')) {
      // Create the table using SQL
      const { error: createError } = await supabase.rpc('create_user_activity_table', {});
      
      if (createError) {
        // Failed to create user_activity table
      } else {
        // user_activity table created successfully
      }
    }
  } catch (err) {
    // Could not verify/create user_activity table
  }
}

// Export function to get active users (updated for database-based tracking)
export const getActiveUsers = async () => {
  try {
    const twoMinutesAgo = new Date(Date.now() - (2 * 60 * 1000)).toISOString();
    
    // Clean up old activity first
    await supabase
      .from('user_activity')
      .delete()
      .lt('last_seen', twoMinutesAgo);

    // Get current active users
    const { data: activeUsers, error } = await supabase
      .from('user_activity')
      .select('user_email')
      .gte('last_seen', twoMinutesAgo);

    if (error) {
      return 0;
    }

    return activeUsers?.length || 0;
  } catch (err) {
    return 0;
  }
}; 