import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Users, Activity } from 'lucide-react';
// Removed: import { getActivity, getActivitySummary, formatTimestamp, getActivityColor, ACTIVITY_TYPES } from '../../lib/loginActivity';

const LoginActivityPanel = () => {
  const [activity, setActivity] = useState([]);
  const [summary, setSummary] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper functions for formatting
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  const getActivityColor = (type, timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - new Date(timestamp)) / (1000 * 60));
    if (type === 'login') {
      if (diffInMinutes < 5) return 'text-green-400';
      if (diffInMinutes < 30) return 'text-green-500';
      return 'text-blue-400';
    } else {
      if (diffInMinutes < 5) return 'text-orange-400';
      return 'text-slate-400';
    }
  };

  // Load activity data from backend API only
  const loadActivity = async () => {
    try {
      const apiUrl = import.meta.env.DEV || window.location.hostname === 'localhost'
        ? 'http://localhost:3001/api/activity-summary'
        : '/api/activity-summary';
      const response = await fetch(apiUrl);
      if (response.ok) {
        const apiData = await response.json();
        if (apiData.success) {
          setActivity(apiData.summary.recentActivity || []);
          setSummary(apiData.summary);
        }
      } else {
        setActivity([]);
        setSummary({});
      }
    } catch (error) {
      setActivity([]);
      setSummary({});
    }
  };

  useEffect(() => {
    loadActivity();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  const ActivityIcon = ({ type }) => {
    if (type === 'login') {
      return React.createElement(LogIn, { className: "w-4 h-4 text-green-400" });
    } else {
      return React.createElement(LogOut, { className: "w-4 h-4 text-orange-400" });
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'capacity admin':
        return 'text-green-400';
      case 'nsight admin':
        return 'text-purple-400';
      case 'employee':
        return 'text-blue-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-slate-750 border-b border-slate-700 cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-100">Login Activity</h3>
            <p className="text-sm text-slate-400">Real-time user sessions</p>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-green-400 font-semibold">{summary.totalLogins || 0}</div>
            <div className="text-slate-500">Logins</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-semibold">{summary.totalLogouts || 0}</div>
            <div className="text-slate-500">Logouts</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold">{summary.uniqueUsers || 0}</div>
            <div className="text-slate-500">Users</div>
          </div>
          <Clock className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Activity List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {activity.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-xs mt-1">User logins and logouts will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {activity.map((item, index) => (
                <div 
                  key={item.id}
                  className={`p-3 hover:bg-slate-750 transition-colors ${
                    index === 0 ? 'bg-slate-750/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ActivityIcon type={item.type} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-200 font-medium">
                            {item.userName}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full bg-slate-700 ${getRoleColor(item.userRole)}`}>
                            {item.userRole}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {item.userEmail}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getActivityColor(item.type, item.timestamp)}`}>
                        {item.type === 'login' ? 'Logged in' : 'Logged out'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatTimestamp(item.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Footer */}
          {activity.length > 0 && (
            <div className="p-3 bg-slate-750 border-t border-slate-700">
              <p className="text-xs text-slate-400 text-center">
                Showing last {activity.length} activities • Updates automatically
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginActivityPanel; 