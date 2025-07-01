// Login Activity Tracking System
const ACTIVITY_STORAGE_KEY = 'capacity-login-activity';

// Activity types
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  LOGOUT: 'logout'
};

// Helper function to format timestamps
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

// Get activity color based on type and recency
export const getActivityColor = (type, timestamp) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now - new Date(timestamp)) / (1000 * 60));
  
  if (type === ACTIVITY_TYPES.LOGIN) {
    if (diffInMinutes < 5) return 'text-green-400'; // Very recent login
    if (diffInMinutes < 30) return 'text-green-500'; // Recent login
    return 'text-blue-400'; // Older login
  } else {
    if (diffInMinutes < 5) return 'text-orange-400'; // Very recent logout
    return 'text-slate-400'; // Older logout
  }
};

// Load activity from storage
const loadActivity = () => {
  try {
    const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading login activity:', error);
    return [];
  }
};

// Save activity to storage
const saveActivity = (activity) => {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity));
  } catch (error) {
    console.error('Error saving login activity:', error);
  }
};

// Record a login/logout event
export const recordActivity = (type, userEmail, userData = null) => {
  const activity = loadActivity();
  
  const newActivity = {
    id: Date.now() + Math.random(), // Unique ID
    type,
    userEmail,
    userName: userData?.name || userEmail.split('@')[0], // Use name if available, fallback to email prefix
    userRole: userData?.role || 'Unknown',
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId()
  };
  
  // Add to beginning of array (most recent first)
  activity.unshift(newActivity);
  
  // Keep only last 50 activities
  const trimmedActivity = activity.slice(0, 50);
  
  saveActivity(trimmedActivity);
  
  // Trigger storage event for real-time updates across components
  window.dispatchEvent(new CustomEvent('loginActivityUpdate', { detail: newActivity }));
  
  return newActivity;
};

// Generate a simple session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all activity (optionally filtered)
export const getActivity = (options = {}) => {
  const activity = loadActivity();
  let filtered = activity;
  
  // Filter by type
  if (options.type) {
    filtered = filtered.filter(item => item.type === options.type);
  }
  
  // Filter by user
  if (options.userEmail) {
    filtered = filtered.filter(item => item.userEmail === options.userEmail);
  }
  
  // Limit results
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  // Filter by time range (hours)
  if (options.hoursBack) {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - options.hoursBack);
    filtered = filtered.filter(item => new Date(item.timestamp) > cutoff);
  }
  
  return filtered;
};

// Get recent activity summary
export const getActivitySummary = (hoursBack = 24) => {
  const activity = getActivity({ hoursBack });
  
  const summary = {
    totalLogins: activity.filter(a => a.type === ACTIVITY_TYPES.LOGIN).length,
    totalLogouts: activity.filter(a => a.type === ACTIVITY_TYPES.LOGOUT).length,
    uniqueUsers: new Set(activity.map(a => a.userEmail)).size,
    recentActivity: activity.slice(0, 10)
  };
  
  return summary;
};

// Clear old activity (keep last N days)
export const cleanupOldActivity = (daysToKeep = 7) => {
  const activity = loadActivity();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  
  const cleaned = activity.filter(item => new Date(item.timestamp) > cutoff);
  saveActivity(cleaned);
  
  return cleaned.length;
};

// Export for debugging
export const clearAllActivity = () => {
  localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('loginActivityUpdate', { detail: null }));
}; 