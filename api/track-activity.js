import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// In-memory activity tracking (in production, use Redis or database)
let userActivity = new Map();

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
    const { userId, page } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Update user activity
    userActivity.set(userId, {
      lastSeen: Date.now(),
      page: page || 'unknown',
      timestamp: new Date().toISOString()
    });

    // Clean up old activity (remove users inactive for more than 10 minutes)
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
    for (const [id, activity] of userActivity.entries()) {
      if (activity.lastSeen < tenMinutesAgo) {
        userActivity.delete(id);
      }
    }

    // Try to update user profile updated_at timestamp as well
    try {
      await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId);
    } catch (dbError) {
      // Don't fail if database update fails
      console.log('Database update failed (non-critical):', dbError.message);
    }

    console.log(`👤 Activity tracked for user ${userId} on page ${page}. Active users: ${userActivity.size}`);

    res.status(200).json({ 
      success: true,
      activeUsers: userActivity.size,
      message: 'Activity tracked'
    });

  } catch (error) {
    console.error('❌ Activity tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track activity',
      details: error.message
    });
  }
}

// Export the activity map for use by usage analytics
export const getActiveUsers = () => {
  const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
  
  // Clean up old activity
  for (const [id, activity] of userActivity.entries()) {
    if (activity.lastSeen < tenMinutesAgo) {
      userActivity.delete(id);
    }
  }
  
  return userActivity.size;
}; 