import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for database writes
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      userEmail, 
      userName, 
      userRole, 
      eventType, 
      sessionId,
      ipAddress,
      userAgent 
    } = req.body;

    // Validate required fields
    if (!userEmail || !eventType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userEmail', 'eventType']
      });
    }

    // Validate event type
    if (!['login', 'logout'].includes(eventType)) {
      return res.status(400).json({ 
        error: 'Invalid event type',
        allowedTypes: ['login', 'logout']
      });
    }

    // Prepare event data
    const eventData = {
      user_email: userEmail,
      user_name: userName || userEmail.split('@')[0],
      user_role: userRole || 'Employee',
      event_type: eventType,
      session_id: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ip_address: ipAddress || req.ip || req.connection?.remoteAddress,
      user_agent: userAgent || req.headers['user-agent']
    };

    // Insert login event into database
    const { data, error } = await supabase
      .from('login_events')
      .insert(eventData)
      .select();

    if (error) {
      // console.error removed
      return res.status(500).json({ 
        error: 'Failed to record login event',
        details: error.message
      });
    }



    // Also store in localStorage for immediate frontend updates (dual storage)
    // This ensures immediate UI updates while database provides persistence
    const localStorageEvent = {
      id: data[0].id,
      type: eventType,
      userEmail: userEmail,
      userName: userName || userEmail.split('@')[0],
      userRole: userRole || 'Employee',
      timestamp: data[0].created_at,
      sessionId: eventData.session_id
    };

    return res.status(200).json({
      success: true,
      event: data[0],
      localStorageEvent: localStorageEvent,
      message: `${eventType} event recorded successfully`
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}

// Helper function to get recent login events (can be called by other APIs)
export const getRecentLoginEvents = async (hoursBack = 24) => {
  try {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('login_events')
      .select('*')
      .gte('created_at', cutoffTime.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      return [];
    }

    return data || [];
  } catch (error) {
    return [];
  }
};

// Helper function to calculate login/logout summary
export const getLoginEventsSummary = async (hoursBack = 24) => {
  try {
    const events = await getRecentLoginEvents(hoursBack);
    
    const loginEvents = events.filter(e => e.event_type === 'login');
    const logoutEvents = events.filter(e => e.event_type === 'logout');
    
    const uniqueUsers = new Set(events.map(e => e.user_email)).size;
    
    // Get recent activity for display
    const recentActivity = events.slice(0, 10).map(event => ({
      id: event.id,
      type: event.event_type,
      userEmail: event.user_email,
      userName: event.user_name,
      userRole: event.user_role,
      timestamp: event.created_at,
      sessionId: event.session_id
    }));

    return {
      totalLogins: loginEvents.length,
      totalLogouts: logoutEvents.length,
      uniqueUsers: uniqueUsers,
      recentActivity: recentActivity,
      hoursBack: hoursBack
    };
  } catch (error) {
    return {
      totalLogins: 0,
      totalLogouts: 0,
      uniqueUsers: 0,
      recentActivity: [],
      hoursBack: hoursBack
    };
  }
}; 