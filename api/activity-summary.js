import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { hoursBack = 24 } = req.query;
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    // Get online users from user_activity table (active in last 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const { data: onlineUsers, error: onlineError } = await supabase
      .from('user_activity')
      .select('user_email, user_name, user_role, last_seen')
      .gte('last_seen', twoMinutesAgo.toISOString());

    if (onlineError) {
      console.error('Error fetching online users:', onlineError);
    }

    // Get activity data from localStorage fallback and user creation data
    // Since we don't have a login_activity table yet, we'll use user_profiles creation times
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, created_at, updated_at')
      .gte('created_at', cutoffTime.toISOString());

    if (usersError) {
      console.error('Error fetching user activity:', usersError);
    }

    // Calculate activity summary
    const currentTime = new Date();
    const onlineCount = onlineUsers?.length || 0;

    // For now, use user registrations as login events since we don't have login history
    // In a real system, you'd have an auth_events table
    const recentRegistrations = users?.filter(user => 
      new Date(user.created_at) > cutoffTime
    ) || [];

    const loginCount = recentRegistrations.length;
    
    // For logout count, we'll start with 0 and build this up as users actually log out
    const logoutCount = 0;

    // Recent activity simulation based on user activity
    const recentActivity = onlineUsers?.map(user => ({
      id: Date.now() + Math.random(),
      type: 'login',
      userEmail: user.user_email,
      userName: user.user_name,
      userRole: user.user_role,
      timestamp: user.last_seen
    })) || [];

    const summary = {
      totalLogins: loginCount,
      totalLogouts: logoutCount,
      uniqueUsers: new Set([
        ...recentRegistrations.map(u => u.email),
        ...(onlineUsers?.map(u => u.user_email) || [])
      ]).size,
      onlineUsers: onlineCount,
      recentActivity: recentActivity.slice(0, 10),
      hoursBack: hoursBack,
      timestamp: currentTime.toISOString()
    };

    return res.status(200).json({
      success: true,
      summary,
      onlineUsers: onlineUsers || [],
      debug: {
        cutoffTime: cutoffTime.toISOString(),
        recentRegistrations: recentRegistrations.length,
        onlineUsersCount: onlineCount
      }
    });

  } catch (error) {
    console.error('❌ Activity summary error:', error);
    return res.status(500).json({ 
      error: 'Failed to get activity summary', 
      details: error.message 
    });
  }
} 