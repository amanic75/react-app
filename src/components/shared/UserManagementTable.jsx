import React, { useState, useEffect } from 'react';
import { Users, MoreHorizontal, ExternalLink, Activity, LogIn, LogOut, Circle, ChevronDown, ChevronRight, FolderOpen, FlaskConical, Code, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getActivity, 
  getActivitySummary, 
  formatTimestamp, 
  getActivityColor, 
  ACTIVITY_TYPES 
} from '../../lib/loginActivity';

const UserManagementTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activity, setActivity] = useState([]);
  const [activitySummary, setActivitySummary] = useState({});
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const navigate = useNavigate();
  const usersPerPage = 20;
  const { getAllUsers, userProfile } = useAuth();

  // Helper function to get app access based on role
  const getAppAccessByRole = (role) => {
    switch (role) {
      case 'Capacity Admin':
        return ['formulas', 'suppliers', 'raw-materials'];
      case 'NSight Admin':
        return ['developer-mode', 'existing-company-mode'];
      case 'Employee':
        return ['formulas'];
      default:
        return ['formulas'];
    }
  };

  // Helper function to get app icons
  const getAppIcon = (appName) => {
    switch (appName) {
      case 'formulas':
        return React.createElement(FolderOpen, { className: "w-4 h-4 text-blue-500" });
      case 'raw-materials':
        return React.createElement(FlaskConical, { className: "w-4 h-4 text-blue-500" });
      case 'suppliers':
        return React.createElement(Users, { className: "w-4 h-4 text-blue-500" });
      case 'developer-mode':
        return React.createElement(Code, { className: "w-4 h-4 text-blue-500" });
      case 'existing-company-mode':
        return React.createElement(Building2, { className: "w-4 h-4 text-green-500" });
      default:
        return null;
    }
  };

  // Load all data
  const loadData = async () => {
    try {
      // Load users from Supabase
      const { data: profiles, error } = await getAllUsers();
      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      // Transform Supabase user_profiles data to match expected format
      const allUsers = profiles.map((profile) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email.split('@')[0],
        email: profile.email,
        role: profile.role || 'Employee',
        status: 'Active',
        lastLogin: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'Never',
        contact: '',
        appAccess: profile.app_access || getAppAccessByRole(profile.role || 'Employee'),
        department: profile.department || '',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }));

      // Get activity data from API (production) or localStorage (development fallback)
      let recentActivity = [];
      let summary = { totalLogins: 0, totalLogouts: 0, uniqueUsers: 0 };
      let apiOnlineUsers = [];

      try {
        const apiUrl = import.meta.env.DEV || window.location.hostname === 'localhost'
          ? 'http://localhost:3001/api/activity-summary'
          : '/api/activity-summary';
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const apiData = await response.json();
          if (apiData.success) {
            summary = apiData.summary;
            apiOnlineUsers = apiData.onlineUsers || [];
            recentActivity = apiData.summary.recentActivity || [];
            console.log('📊 Activity summary from API:', { summary, onlineCount: apiOnlineUsers.length });
          }
        } else {
          throw new Error(`API responded with ${response.status}`);
        }
      } catch (error) {
        console.warn('⚠️ Failed to fetch activity from API, using localStorage fallback:', error.message);
        // Fallback to localStorage for development
        recentActivity = getActivity({ limit: 50 });
        summary = getActivitySummary(24);
      }
      
      // Track online users - use API data if available, otherwise fallback to localStorage logic
      let onlineUserEmails = new Set();
      
      if (apiOnlineUsers.length > 0) {
        // Use API online users data (more reliable)
        apiOnlineUsers.forEach(user => {
          onlineUserEmails.add(user.user_email);
        });
        console.log('👥 Online users from API:', Array.from(onlineUserEmails));
      } else {
        // Fallback to localStorage logic for development
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        
        // Process activity to determine who's online
        const userLastActivity = {};
        recentActivity.forEach(act => {
          if (!userLastActivity[act.userEmail] || new Date(act.timestamp) > new Date(userLastActivity[act.userEmail].timestamp)) {
            userLastActivity[act.userEmail] = act;
          }
        });
        
        Object.entries(userLastActivity).forEach(([email, lastAct]) => {
          const actTime = new Date(lastAct.timestamp);
          if (actTime > thirtyMinutesAgo && lastAct.type === ACTIVITY_TYPES.LOGIN) {
            onlineUserEmails.add(email);
          }
        });
      }
      
      // Update last login times from activity data
      const usersWithActivity = allUsers.map(user => {
        const userActivity = recentActivity.filter(act => act.userEmail === user.email);
        const lastLogin = userActivity.find(act => act.type === ACTIVITY_TYPES.LOGIN);
        
        return {
          ...user,
          lastLoginActivity: lastLogin,
          recentActivity: userActivity.slice(0, 5), // Last 5 activities
          isOnline: onlineUserEmails.has(user.email)
        };
      });
      
      // Sort by online status first, then by last activity
      const sortedUsers = usersWithActivity.sort((a, b) => {
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        
        const aTime = a.lastLoginActivity ? new Date(a.lastLoginActivity.timestamp) : new Date(0);
        const bTime = b.lastLoginActivity ? new Date(b.lastLoginActivity.timestamp) : new Date(0);
        return bTime - aTime;
      });
      
      setUsers(sortedUsers);
      setActivity(recentActivity);
      setActivitySummary(summary);
      setOnlineUsers(onlineUserEmails);
    } catch (error) {
      console.error('Error in loadData:', error);
    }
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time updates
    const handleActivityUpdate = () => {
      loadData();
    };

    window.addEventListener('loginActivityUpdate', handleActivityUpdate);
    // Removed automatic interval - data will refresh when loginActivityUpdate event fires

    return () => {
      window.removeEventListener('loginActivityUpdate', handleActivityUpdate);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-50';
      case 'Inactive':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'text-purple-600 bg-purple-100';
      case 'Capacity Admin':
        return 'text-green-600 bg-green-100';
      case 'NSight Admin':
        return 'text-indigo-600 bg-indigo-100';
      case 'Employee':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Calculate pagination
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="p-6">
      {/* Header with Activity Summary */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <Users className="h-6 w-6 text-primary-600 mr-2" />
            <button
              onClick={() => navigate('/user-management')}
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors group"
            >
              <h2 className="text-xl font-semibold text-slate-100 group-hover:text-blue-400">User Management & Activity</h2>
              <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />
            </button>
          </div>
          
          {/* Activity Summary Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <Circle className="w-3 h-3 text-green-400 fill-current" />
              <span className="text-green-400 font-semibold">{onlineUsers.size}</span>
              <span className="text-slate-400">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <LogIn className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-semibold">{activitySummary.totalLogins || 0}</span>
              <span className="text-slate-400">Logins</span>
            </div>
            <div className="flex items-center space-x-2">
              <LogOut className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-semibold">{activitySummary.totalLogouts || 0}</span>
              <span className="text-slate-400">Logouts</span>
            </div>
            <div className="text-slate-500 text-xs">Last 24h</div>
          </div>
        </div>
        
        {/* Only show Add User button for Capacity Admin */}
        {userProfile?.role === 'Capacity Admin' && (
          <Button 
            size="sm"
            onClick={() => navigate('/user-management?action=add')}
          >
            Add User
          </Button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-4 font-medium text-slate-200">User</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Last Activity</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">App Access</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <React.Fragment key={user.id}>
                <tr className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleUserExpansion(user.id)}
                        className="text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        {expandedUsers.has(user.id) ? 
                          <ChevronDown className="w-4 h-4" /> : 
                          <ChevronRight className="w-4 h-4" />
                        }
                      </button>
                      <div className="flex items-center space-x-2">
                        <Circle className={`w-2 h-2 ${user.isOnline ? 'text-green-400 fill-current' : 'text-slate-600 fill-current'}`} />
                        <div>
                          <div className="font-medium text-slate-100">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      {user.isOnline && (
                        <span className="text-xs text-green-400 font-medium">ONLINE</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.lastLoginActivity ? (
                      <div className="flex items-center space-x-2">
                        <Activity className={`w-4 h-4 ${getActivityColor(user.lastLoginActivity.type, user.lastLoginActivity.timestamp)}`} />
                        <div>
                          <div className="text-sm text-slate-300">
                            {formatTimestamp(user.lastLoginActivity.timestamp)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {user.lastLoginActivity.type === ACTIVITY_TYPES.LOGIN ? 'Last login' : 'Last logout'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">No recent activity</span>
                    )}
                  </td>
                                      <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {user.appAccess.map((app, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center hover:bg-slate-600 transition-colors"
                            title={app.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          >
                            {getAppIcon(app)}
                          </div>
                        ))}
                      </div>
                    </td>
                </tr>
                
                {/* Expanded row with user details */}
                {expandedUsers.has(user.id) && (
                  <tr className="bg-slate-800 border-b border-slate-700">
                    <td colSpan="5" className="py-4 px-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Details */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-200 mb-3">User Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">ID:</span>
                              <span className="text-slate-300">{user.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Email:</span>
                              <span className="text-slate-300">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Department:</span>
                              <span className="text-slate-300">{user.department || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Created:</span>
                              <span className="text-slate-300">
                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent Activity */}
                        <div>
                          <h4 className="text-sm font-medium text-slate-200 mb-3">Recent Activity</h4>
                          <div className="space-y-2">
                            {user.recentActivity && user.recentActivity.length > 0 ? (
                              user.recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-center space-x-3 text-sm">
                                  <Activity className={`w-3 h-3 ${getActivityColor(activity.type, activity.timestamp)}`} />
                                  <span className="text-slate-300">
                                    {activity.type === ACTIVITY_TYPES.LOGIN ? 'Login' : 'Logout'}
                                  </span>
                                  <span className="text-slate-500">
                                    {formatTimestamp(activity.timestamp)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">No recent activity</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-400">
            Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
          <p className="text-slate-500">Users will appear here once they sign up for accounts.</p>
        </div>
      )}
    </Card>
  );
};

export default UserManagementTable; 