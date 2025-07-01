import React, { useState, useEffect } from 'react';
import { Users, MoreHorizontal, ExternalLink, Activity, LogIn, LogOut, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { getUsers } from '../../lib/data';
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

  // Load all data
  const loadData = () => {
    const allUsers = getUsers();
    const recentActivity = getActivity({ limit: 50 });
    const summary = getActivitySummary(24);
    
    // Track online users (logged in within last 30 minutes without logout)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const onlineUserEmails = new Set();
    
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
  };

  useEffect(() => {
    loadData();
    
    // Set up real-time updates
    const handleActivityUpdate = () => {
      loadData();
    };

    window.addEventListener('loginActivityUpdate', handleActivityUpdate);
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds

    return () => {
      window.removeEventListener('loginActivityUpdate', handleActivityUpdate);
      clearInterval(interval);
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
        
        <Button 
          size="sm"
          onClick={() => navigate('/user-management?action=add')}
        >
          Add User
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600">
              <th className="text-left py-3 px-4 font-medium text-slate-200">User</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Role</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Status</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Last Activity</th>
              <th className="text-left py-3 px-4 font-medium text-slate-200">Actions</th>
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
                    <button className="text-slate-400 hover:text-slate-200">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                
                {/* Expanded Activity Timeline */}
                {expandedUsers.has(user.id) && (
                  <tr>
                    <td colSpan="5" className="py-2 px-4 bg-slate-800">
                      <div className="ml-8 space-y-2">
                        <h4 className="text-sm font-medium text-slate-200 mb-3">Recent Activity</h4>
                        {user.recentActivity.length > 0 ? (
                          <div className="space-y-2">
                            {user.recentActivity.map((act, index) => (
                              <div key={act.id} className="flex items-center space-x-3 text-sm">
                                {act.type === ACTIVITY_TYPES.LOGIN ? (
                                  <LogIn className="w-3 h-3 text-green-400" />
                                ) : (
                                  <LogOut className="w-3 h-3 text-orange-400" />
                                )}
                                <span className={getActivityColor(act.type, act.timestamp)}>
                                  {act.type === ACTIVITY_TYPES.LOGIN ? 'Logged in' : 'Logged out'}
                                </span>
                                <span className="text-slate-500">
                                  {formatTimestamp(act.timestamp)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm">No recent activity recorded</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-600 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-slate-300">
            Showing {startIndex + 1}-{Math.min(endIndex, users.length)} of {users.length} users
          </p>
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Circle className="w-2 h-2 text-green-400 fill-current" />
            <span>Online users shown first</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-300">
            Page {currentPage} of {totalPages}
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserManagementTable; 