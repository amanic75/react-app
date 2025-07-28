import { createClient } from '@supabase/supabase-js';
import { getLoginEventsSummary } from './login-events.js';

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
      // Error fetching online users
    }

    // Get login/logout events from database using the new login-events API
    let loginEventsSummary;
    try {
      loginEventsSummary = await getLoginEventsSummary(hoursBack);
    } catch (error) {
      loginEventsSummary = {
        totalLogins: 0,
        totalLogouts: 0,
        uniqueUsers: 0,
        recentActivity: []
      };
    }

    // Calculate activity summary
    const currentTime = new Date();
    const onlineCount = onlineUsers?.length || 0;

    // Combine online users with login events unique users
    const allUniqueUsers = new Set([
      ...(onlineUsers?.map(u => u.user_email) || []),
      ...loginEventsSummary.recentActivity.map(a => a.userEmail)
    ]);

    const summary = {
      totalLogins: loginEventsSummary.totalLogins,
      totalLogouts: loginEventsSummary.totalLogouts,
      uniqueUsers: allUniqueUsers.size,
      onlineUsers: onlineCount,
      recentActivity: loginEventsSummary.recentActivity,
      hoursBack: hoursBack,
      timestamp: currentTime.toISOString()
    };

    return res.status(200).json({
      success: true,
      summary,
      onlineUsers: onlineUsers || [],
      debug: {
        cutoffTime: cutoffTime.toISOString(),
        loginEventsCount: loginEventsSummary.totalLogins,
        logoutEventsCount: loginEventsSummary.totalLogouts,
        onlineUsersCount: onlineCount
      }
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Failed to get activity summary', 
      details: error.message 
    });
  }
} 