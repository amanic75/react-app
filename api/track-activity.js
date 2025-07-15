import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with anon key (temporary fix until service role key is updated)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
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
    const { userId, userEmail, userName, userRole, page, timestamp } = req.body;
    
    // Support both userId (old format) and userEmail (new format)
    const trackingId = userId || userEmail;
    
    if (!trackingId) {
      return res.status(400).json({ error: 'User ID or email required' });
    }

    // Update user activity with enhanced data
    userActivity.set(trackingId, {
      lastSeen: Date.now(),
      page: page || 'unknown',
      userName: userName || 'Unknown User',
      userRole: userRole || 'Employee',
      userEmail: userEmail || trackingId,
      timestamp: timestamp || new Date().toISOString()
    });

    // Clean up old activity (remove users inactive for more than 1 minute)
    const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
    let cleanedUp = 0;
    for (const [id, activity] of userActivity.entries()) {
      if (activity.lastSeen < oneMinuteAgo) {
        userActivity.delete(id);
        cleanedUp++;
      }
    }

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
          console.error('❌ Database update error:', error);
        } else {
          dbUpdateSuccess = true;
          console.log('✅ Database updated for user:', userEmail);
        }
      } catch (dbError) {
        console.error('❌ Database update failed:', dbError.message);
      }
    }

    console.log(`👤 Activity tracked for ${userName || trackingId} (${userRole}) on page ${page}:`, {
      trackingId,
      userEmail,
      userName,
      userRole,
      inMemoryActiveUsers: userActivity.size,
      dbUpdateSuccess,
      cleanedUpUsers: cleanedUp,
      timestamp: new Date().toISOString()
    });

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
  const oneMinuteAgo = Date.now() - (1 * 60 * 1000);
  
  // Clean up old activity
  for (const [id, activity] of userActivity.entries()) {
    if (activity.lastSeen < oneMinuteAgo) {
      userActivity.delete(id);
    }
  }
  
  return userActivity.size;
}; 