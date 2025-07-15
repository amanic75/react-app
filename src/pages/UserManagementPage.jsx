import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, ArrowUpDown, Plus, FolderOpen, FlaskConical, Users, Edit, ChevronDown, Check, Code, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardLayout from '../layouts/DashboardLayout';
import EditUserModal from '../components/shared/EditUserModal';
import AddUserModal from '../components/shared/AddUserModal';

const UserManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, getAllUsers, updateUserProfile, deleteUserProfile, adminCreateUser, changePassword, getDashboardRoute, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterApp, setFilterApp] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // Temporary states for complex filtering
  const [tempSortBy, setTempSortBy] = useState('name');
  const [tempSortOrder, setTempSortOrder] = useState('asc');
  const [tempFilterRole, setTempFilterRole] = useState('all');
  const [tempFilterStatus, setTempFilterStatus] = useState('all');
  const [tempFilterDomain, setTempFilterDomain] = useState('all');
  const [tempFilterApp, setTempFilterApp] = useState('all');

  // Role-based access control - only Capacity Admin can access user management
  useEffect(() => {
    if (!loading && userProfile) {
      if (userProfile.role !== 'Capacity Admin') {
        console.log(`🚫 Access denied to user management for role: ${userProfile.role}, redirecting to dashboard`);
        const dashboardRoute = getDashboardRoute();
        navigate(dashboardRoute, { replace: true });
      }
    }
  }, [userProfile, loading, navigate, getDashboardRoute]);

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

  // Helper function to get credentials display based on role
  const getRoleCredentials = (role) => {
    switch (role) {
      case 'Capacity Admin':
        return 'admin/secure pass';
      case 'NSight Admin':
        return 'nsight-admin/enterprise pass';
      case 'Employee':
        return 'user/temporary pass';
      default:
        return 'user/temporary pass';
    }
  };

  // Load users from Supabase - moved outside useEffect for reusability
  const loadUsers = async () => {
    if (isLoading) return; // Prevent concurrent loads
    
    try {
      setIsLoading(true);
      const { data, error } = await getAllUsers();
      if (error) {
        console.error('Error loading users:', error);
        return;
      }
      
      // Transform Supabase user_profiles data to match the expected format
      const transformedUsers = data.map((profile, index) => ({
        id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email.split('@')[0],
        email: profile.email || '',
        role: profile.role || 'Employee',
        status: 'Active', // Default status since user_profiles doesn't have status field
        lastLogin: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'Never',
        contact: '',
        appAccess: getAppAccessByRole(profile.role || 'Employee') || [],
        credentials: getRoleCredentials(profile.role || 'Employee') || '',
        department: profile.department || '',
        created_at: profile.created_at,
        updated_at: profile.updated_at
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error in loadUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load users only once on component mount
    loadUsers();
  }, []); // Removed getAllUsers dependency to prevent constant refetching

  // Show loading while checking auth and permissions
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render anything if user doesn't have permission (redirect will happen)
  if (userProfile && userProfile.role !== 'Capacity Admin') {
    return null;
  }

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.relative')) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Check for URL parameters to auto-open add modal or set filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    
    // Handle add modal
    if (urlParams.get('action') === 'add') {
      setIsAddModalOpen(true);
      // Clean up URL parameter
      navigate('/user-management', { replace: true });
    }
    
    // Handle app filter from dashboard
    const appFilter = urlParams.get('filterApp');
    if (appFilter) {
      setFilterApp(appFilter);
      setTempFilterApp(appFilter);
      // Clean up URL parameter
      navigate('/user-management', { replace: true });
    }
  }, [location.search, navigate]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = 
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.id || '').toString().includes(searchTerm);
    
    // Role filter
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    // Domain filter
    const userDomain = (user.email || '').split('@')[1];
    const matchesDomain = filterDomain === 'all' || 
      (filterDomain === 'capacity.com' && userDomain === 'capacity.com') ||
      (filterDomain === 'nsight-inc.com' && userDomain === 'nsight-inc.com') ||
      (filterDomain === 'other' && userDomain !== 'capacity.com' && userDomain !== 'nsight-inc.com');
    
    // App filter
    const matchesApp = filterApp === 'all' || (user.appAccess || []).includes(filterApp);
    
    return matchesSearch && matchesRole && matchesStatus && matchesDomain && matchesApp;
  });

  // Sort filtered users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
        break;
      case 'role':
        // Custom role order: Employee, Admin, NSight Admin
        const roleOrder = { 'Employee': 1, 'Admin': 2, 'NSight Admin': 3 };
        aValue = roleOrder[a.role] || 4;
        bValue = roleOrder[b.role] || 4;
        break;
      case 'lastLogin':
        aValue = new Date(a.lastLogin);
        bValue = new Date(b.lastLogin);
        break;
      case 'email':
        aValue = (a.email || '').toLowerCase();
        bValue = (b.email || '').toLowerCase();
        break;
      case 'id':
        aValue = a.id;
        bValue = b.id;
        break;
      case 'domain':
        aValue = (a.email || '').split('@')[1];
        bValue = (b.email || '').split('@')[1];
        break;
      case 'appAccess':
        aValue = (a.appAccess || []).length;
        bValue = (b.appAccess || []).length;
        break;
      case 'status':
        aValue = a.status;
        bValue = a.status;
        break;
      default:
        aValue = (a.name || '').toLowerCase();
        bValue = (b.name || '').toLowerCase();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const updates = {
        first_name: updatedUser.name.split(' ')[0] || '',
        last_name: updatedUser.name.split(' ').slice(1).join(' ') || '',
        role: updatedUser.role,
        department: updatedUser.department || ''
      };
      
      const { error } = await updateUserProfile(updatedUser.id, updates);
      if (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user. Please try again.');
        return;
      }
      
      // Refresh the users list
      await loadUsers();
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error in handleSaveUser:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      console.log('🔄 UserManagementPage: Deleting user with ID:', userId);
      
      // Check if trying to delete the currently authenticated user
      if (user && user.id === userId) {
        alert('Cannot delete your own account while logged in. Please have another admin delete your account, or sign out first.');
        return;
      }
      
      // Find the user being deleted to get their email
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete) {
        alert('User not found in current list.');
        return;
      }
      
      console.log('🔄 UserManagementPage: Deleting user:', userToDelete.email);
      
      const { data, error } = await deleteUserProfile(userId);
      
      if (error) {
        console.error('❌ UserManagementPage: Delete failed:', error);
        alert(`Failed to delete user: ${error.message || error}`);
        return;
      }

      console.log('✅ UserManagementPage: Delete successful, refreshing user list...');
      
      // Wait a moment before refreshing to allow any auth state changes to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Only refresh the users list if delete actually succeeded
      try {
        await loadUsers();
        console.log(`📝 UserManagementPage: Refreshed user list after deletion`);
        
        // Check if the user was actually removed
        const userStillExists = users.some(u => u.id === userId);
        if (userStillExists) {
          console.warn('⚠️ UserManagementPage: User still exists after deletion - likely auto-recreated');
          alert('User profile was deleted but may have been automatically recreated. This can happen if the user is currently authenticated in another session.');
        } else {
          alert('User deleted successfully!');
        }
      } catch (refreshError) {
        console.error('❌ UserManagementPage: Error refreshing users:', refreshError);
        alert('User deleted but failed to refresh list. Please reload the page.');
        return;
      }
      
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('❌ UserManagementPage: Unexpected error in handleDeleteUser:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveNewUser = async (newUser) => {
    try {
      console.log('🔧 Admin creating new user:', newUser.email);
      
      // Use the adminCreateUser function to create user without affecting current session
      const { data, error } = await adminCreateUser(newUser.email, newUser.password, {
        firstName: newUser.name.split(' ')[0] || '',
        lastName: newUser.name.split(' ').slice(1).join(' ') || '',
        role: newUser.role,
        department: newUser.department || ''
      });

      if (error) {
        console.error('❌ Error creating user:', error);
        alert(`Failed to create user: ${error.message || error}`);
        return;
      }

      console.log('✅ User created successfully:', data);
      alert(`User created successfully! Email: ${newUser.email}\nPassword: ${newUser.password}\n\nPlease share these credentials with the user and ask them to change their password on first login.`);
      
      // Refresh the users list
      await loadUsers();
      
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('❌ Error in handleSaveNewUser:', error);
      alert(`Unexpected error: ${error.message}`);
    }
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSortChange = (newSortBy) => {
    setTempSortBy(newSortBy);
  };

  const toggleSortOrder = () => {
    setTempSortOrder(tempSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const clearAllFilters = () => {
    setSortBy('name');
    setSortOrder('asc');
    setFilterRole('all');
    setFilterStatus('all');
    setFilterDomain('all');
    setFilterApp('all');
    setSearchTerm('');
    
    // Reset temp states
    setTempSortBy('name');
    setTempSortOrder('asc');
    setTempFilterRole('all');
    setTempFilterStatus('all');
    setTempFilterDomain('all');
    setTempFilterApp('all');
  };

  const applyFilters = () => {
    setSortBy(tempSortBy);
    setSortOrder(tempSortOrder);
    setFilterRole(tempFilterRole);
    setFilterStatus(tempFilterStatus);
    setFilterDomain(tempFilterDomain);
    setFilterApp(tempFilterApp);
    setIsFilterOpen(false);
  };

  const cancelFilters = () => {
    setTempSortBy(sortBy);
    setTempSortOrder(sortOrder);
    setTempFilterRole(filterRole);
    setTempFilterStatus(filterStatus);
    setTempFilterDomain(filterDomain);
    setTempFilterApp(filterApp);
    setIsFilterOpen(false);
  };

  // Toggle filter dropdown and initialize temp states when opening
  const toggleFilter = () => {
    if (isFilterOpen) {
      // If already open, close it (same as cancel)
      cancelFilters();
    } else {
      // If closed, open it and initialize temp states
      setTempSortBy(sortBy);
      setTempSortOrder(sortOrder);
      setTempFilterRole(filterRole);
      setTempFilterStatus(filterStatus);
      setTempFilterDomain(filterDomain);
      setTempFilterApp(filterApp);
      setIsFilterOpen(true);
    }
  };

  // Helper function to handle password changes
  const handleChangePassword = async (passwordData) => {
    // Validate input
    if (!passwordData || !passwordData.email || !passwordData.newPassword) {
      console.error('Invalid password data:', passwordData);
      return { 
        success: false, 
        error: 'Invalid password data provided' 
      };
    }

    // Check if current user has Capacity Admin role
    if (userProfile?.role !== 'Capacity Admin') {
      console.error('Insufficient permissions for password change');
      return { success: false, error: 'Insufficient permissions' };
    }

    try {
      console.log('Password change requested for:', passwordData.email);
      console.log('Admin user:', userProfile?.email);
      
      if (passwordData.email === user?.email) {
        // If admin is changing their own password
        console.log('Admin changing own password');
        const { error } = await changePassword(passwordData.newPassword);
        
        if (error) {
          console.error('Password change error:', error);
          return { 
            success: false, 
            error: error.message || 'Failed to change password' 
          };
        }
        
        console.log('Password change successful for own account');
        return { 
          success: true, 
          message: `Password successfully changed for ${passwordData.email}` 
        };
      } else {
        // For other users - call secure backend API
        console.log('Admin changing another user\'s password');
        
        // Get current user's session token for API authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No active session found');
          return { 
            success: false, 
            error: 'No active session found. Please log in again.' 
          };
        }

        // Call the consolidated secure backend API
        const response = await fetch('/api/admin/users?action=change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            targetEmail: passwordData.email,
            newPassword: passwordData.newPassword,
            adminToken: session.access_token
          })
        });

        if (!response.ok) {
          console.error('API request failed with status:', response.status);
          try {
            const errorResult = await response.json();
            console.error('API Error:', errorResult.error);
            return { 
              success: false, 
              error: errorResult.error || 'Failed to change password' 
            };
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
            return { 
              success: false, 
              error: 'Failed to change password. Server error.' 
            };
          }
        }

        const result = await response.json();
        console.log('Password change API response:', result);

        return { 
          success: true, 
          message: result.message || `Password successfully changed for ${passwordData.email}` 
        };
      }
      
    } catch (error) {
      console.error('Password change error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to change password. Please try again.' 
      };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-400" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="grid grid-cols-3 gap-1 p-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-slate-400 rounded-sm"></div>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-slate-100">User Management</h1>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              
              <div className="relative">
                <button 
                  onClick={toggleFilter}
                  className="flex items-center space-x-2 p-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Filter className="h-5 w-5 text-slate-300" />
                  <span className="text-sm text-slate-300">Filter & Sort</span>
                  <ChevronDown className="h-4 w-4 text-slate-300" />
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      {/* Sort Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-slate-200">Sort By</h3>
                          <button
                            onClick={toggleSortOrder}
                            className="flex items-center space-x-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                          >
                            <span>{tempSortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                            <span>{tempSortOrder === 'asc' ? '↑' : '↓'}</span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'name', label: 'Name' },
                            { key: 'role', label: 'Role' },
                            { key: 'lastLogin', label: 'Last Login' },
                            { key: 'email', label: 'Email' },
                            { key: 'id', label: 'ID' },
                            { key: 'domain', label: 'Domain' },
                            { key: 'appAccess', label: 'App Count' },
                            { key: 'status', label: 'Status' }
                          ].map((option) => (
                            <button
                              key={option.key}
                              onClick={() => handleSortChange(option.key)}
                              className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                                tempSortBy === option.key 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Filter Section */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Role Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Role</h3>
                            <select
                              value={tempFilterRole}
                              onChange={(e) => setTempFilterRole(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Roles</option>
                              <option value="Employee">Employee</option>
                              <option value="Admin">Admin</option>
                              <option value="NSight Admin">NSight Admin</option>
                            </select>
                          </div>

                          {/* Status Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Status</h3>
                            <select
                              value={tempFilterStatus}
                              onChange={(e) => setTempFilterStatus(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Domain Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by Domain</h3>
                            <select
                              value={tempFilterDomain}
                              onChange={(e) => setTempFilterDomain(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Domains</option>
                              <option value="capacity.com">@capacity.com</option>
                              <option value="nsight-inc.com">@nsight-inc.com</option>
                              <option value="other">Other Domains</option>
                            </select>
                          </div>

                          {/* App Filter */}
                          <div>
                            <h3 className="text-sm font-medium text-slate-200 mb-2">Filter by App Access</h3>
                            <select
                              value={tempFilterApp}
                              onChange={(e) => setTempFilterApp(e.target.value)}
                              className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm"
                            >
                              <option value="all">All Apps</option>
                              <option value="formulas">Has Formulas Access</option>
                              <option value="suppliers">Has Suppliers Access</option>
                              <option value="raw-materials">Has Raw Materials Access</option>
                              <option value="developer-mode">Has Developer Mode Access</option>
                              <option value="existing-company-mode">Has Existing Company Mode Access</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-slate-600 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={cancelFilters}
                            className="px-3 py-2 bg-slate-600 text-white rounded text-sm hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={applyFilters}
                            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors font-medium"
                          >
                            Apply Filters
                          </button>
                        </div>
                        <button
                          onClick={clearAllFilters}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              {/* Refresh button */}
              <button
                onClick={loadUsers}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:opacity-50 text-slate-200 rounded-lg transition-colors"
                title="Refresh user list"
              >
                <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
              </button>

              {/* Only show Add User button for Capacity Admin */}
              {userProfile?.role === 'Capacity Admin' && (
                <button
                  onClick={handleAddUser}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">User Access Management</h2>
              <div className="flex items-center space-x-4 mt-2">
                <p className="text-sm text-slate-400">
                  Showing {sortedUsers.length} of {users.length} users
                </p>
                {(filterRole !== 'all' || filterStatus !== 'all' || filterDomain !== 'all' || filterApp !== 'all' || sortBy !== 'name') && (
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-xs text-slate-500">Active filters:</span>
                    {filterRole !== 'all' && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">
                        Role: {filterRole}
                      </span>
                    )}
                    {filterStatus !== 'all' && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Status: {filterStatus}
                      </span>
                    )}
                    {filterDomain !== 'all' && (
                      <span className="px-2 py-1 bg-orange-600 text-white text-xs rounded">
                        Domain: {filterDomain}
                      </span>
                    )}
                    {filterApp !== 'all' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        App: {filterApp}
                      </span>
                    )}
                    {sortBy !== 'name' && (
                      <span className="px-2 py-1 bg-slate-600 text-white text-xs rounded">
                        Sort: {sortBy} ({sortOrder})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800 rounded-lg shadow-sm overflow-hidden border border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed min-w-[1240px]">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-750">
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[180px]">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[120px]">ID</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[220px]">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[140px]">Role</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[120px]">Contact</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[160px]">App Access</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[180px]">Credentials</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-300 w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((employee, index) => (
                    <tr 
                      key={employee.id || `user-${index}`} 
                      className="border-b border-slate-700 hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-100 font-medium truncate" title={employee.name || ''}>
                        {employee.name || ''}
                      </td>
                                             <td className="px-6 py-4">
                         <span className="inline-flex items-center px-2 py-1 bg-slate-700 text-slate-200 text-xs font-mono rounded border border-slate-600">
                           #{employee.id || ''}
                         </span>
                       </td>
                      <td className="px-6 py-4 text-sm text-slate-300 truncate" title={employee.email || ''}>
                        <a href={`mailto:${employee.email || ''}`} className="text-blue-400 hover:text-blue-300 underline truncate block">
                          {employee.email || ''}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium truncate ${getRoleColor(employee.role || 'Employee')}`}>
                          {employee.role || 'Employee'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 truncate" title={employee.contact || ''}>
                        {employee.contact || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1 overflow-x-auto">
                          {(employee.appAccess || []).map((app, appIndex) => (
                            <div
                              key={`${app}-${appIndex}`}
                              className="w-8 h-8 bg-slate-700 rounded-md flex items-center justify-center hover:bg-slate-600 transition-colors flex-shrink-0"
                              title={typeof app === 'string' ? app.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                            >
                              {getAppIcon(app)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 truncate" title={employee.credentials || ''}>
                        {employee.credentials || ''}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleEditUser(employee)}
                          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600 rounded-md transition-colors"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSaveUser}
        onDelete={handleDeleteUser}
        currentUserRole={userProfile?.role || 'Employee'}
        onChangePassword={handleChangePassword}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSave={handleSaveNewUser}
      />
    </DashboardLayout>
  );
};

export default UserManagementPage; 