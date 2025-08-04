import React, { useState, useRef, useEffect } from 'react';
import { Search, FolderOpen, FlaskConical, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../ui/Card';
import UserManagementTable from './UserManagementTable';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { isGlobalAdmin, isCompanyAdmin } from '../../lib/roleUtils';

const AdminDashboard = ({ userData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [users, setUsers] = useState([]);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);
  const [companyApps, setCompanyApps] = useState([]);
  const cardRefs = useRef({});
  const navigate = useNavigate();
  const { getAllUsers, getCompanyUsers, userProfile } = useAuth();

  const handleMouseMove = (e, cardId) => {
    if (!cardRefs.current[cardId]) return;
    
    const rect = cardRefs.current[cardId].getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

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

  // Get company ID for current user if they're a Company Admin
  useEffect(() => {
    // Get company ID from userProfile
    if (!userProfile || !isCompanyAdmin(userProfile.role)) {
      setCurrentCompanyId(null);
      return;
    }

    if (userProfile?.company_id) {
      setCurrentCompanyId(userProfile.company_id);
    }
  }, [userProfile]);

  // Load company apps from company_apps table
  useEffect(() => {
    const loadCompanyApps = async () => {
      if (!currentCompanyId) {
        setCompanyApps([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('company_apps')
          .select('app_name, enabled')
          .eq('company_id', currentCompanyId)
          .eq('enabled', true);

        if (error) {
          console.error('Error loading company apps:', error);
          setCompanyApps([]);
          return;
        }

        // Map app names to our app keys
        const appNameToKey = {
          'Formulas Management': 'formulas',
          'Raw Materials': 'raw-materials',
          'Suppliers': 'suppliers'
        };

        const appKeys = data.map(app => appNameToKey[app.app_name]).filter(Boolean);
        setCompanyApps(appKeys);
      } catch (error) {
        console.error('Error loading company apps:', error);
        setCompanyApps([]);
      }
    };

    loadCompanyApps();
  }, [currentCompanyId]);

  // Load users for app access display
  useEffect(() => {
    const loadUsers = async () => {
      try {
        let profiles, error;
        
        // Different access levels based on company_id and role
        if (isGlobalAdmin(userProfile?.role)) {
          // NSight Admins see all users globally
          ({ data: profiles, error } = await getAllUsers({ applyCompanyFilter: false }));
        } else if (isCompanyAdmin(userProfile?.role) && currentCompanyId) {
          // Company Admins see their company's users PLUS all NSight Admins
          // Get company users
          const { data: companyUsers, error: companyError } = await getCompanyUsers(currentCompanyId);
          if (companyError) {
            throw companyError;
          }
          
          // Get all NSight Admins (they should be visible to all company admins)
          const { data: allUsers, error: allUsersError } = await getAllUsers({ applyCompanyFilter: false });
          if (allUsersError) {
            throw allUsersError;
          }
          
          // Filter NSight Admins from all users
          const nsightAdmins = allUsers.filter(user => isGlobalAdmin(user.role));
          
          // Combine company users with NSight Admins (remove duplicates by id)
          const combinedUsers = [...companyUsers];
          nsightAdmins.forEach(admin => {
            if (!combinedUsers.find(user => user.id === admin.id)) {
              combinedUsers.push(admin);
            }
          });
          
          profiles = combinedUsers;
          error = null;
        } else {
          // No access or still loading
          setUsers([]);
          return;
        }
        
        if (error) {
          // console.error removed
          return;
        }

        // Transform Supabase user_profiles data to match expected format
        const transformedUsers = profiles.map((profile) => ({
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email.split('@')[0],
          email: profile.email,
          role: profile.company_role || profile.role || 'Employee', // Use company_role if available
          status: profile.company_status || 'Active', // Use company_status if available
          lastLogin: profile.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'Never',
          contact: '',
          appAccess: profile.app_access || getAppAccessByRole(profile.company_role || profile.role || 'Employee'),
          department: profile.department || '',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
        
        setUsers(transformedUsers);
      } catch (error) {
        // console.error removed
      }
    };
    
    // For Capacity Admins, wait until we have the company ID
    if (userProfile?.role === 'Capacity Admin' && !currentCompanyId) {
      return; // Wait for company ID to be loaded
    }
    
    loadUsers();
  }, [currentCompanyId, userProfile?.role]); // Re-load when company ID is available

  // Get users who have access to a specific app
  const getUsersWithAccess = (appName) => {
    const appMap = {
      'Formulas': 'formulas',
      'Raw Materials': 'raw-materials', 
      'Suppliers': 'suppliers'
    };
    const appKey = appMap[appName];
    return users.filter(user => user.appAccess && user.appAccess.includes(appKey));
  };

  const allApplications = [
    {
      id: 1,
      title: 'Formulas',
      icon: FolderOpen,
      glowColor: 'rgba(59, 130, 246, 0.3)', // Blue
      iconBgColor: 'bg-blue-900',
      iconColor: 'text-blue-400',
      borderColor: 'hover:border-blue-500',
      appKey: 'formulas'
    },
    {
      id: 2,
      title: 'Raw Materials',
      icon: FlaskConical,
      glowColor: 'rgba(249, 115, 22, 0.3)', // Orange
      iconBgColor: 'bg-orange-900',
      iconColor: 'text-orange-400',
      borderColor: 'hover:border-orange-500',
      appKey: 'raw-materials'
    },
    {
      id: 3,
      title: 'Suppliers',
      icon: Users,
      glowColor: 'rgba(217, 70, 239, 0.3)', // Magenta
      iconBgColor: 'bg-fuchsia-900',
      iconColor: 'text-fuchsia-400',
      borderColor: 'hover:border-fuchsia-500',
      appKey: 'suppliers'
    }
  ];

  // Filter applications based on user's access and company apps
  const applications = (() => {
    // For company admins, PRIORITIZE company_apps table over individual app_access
    if (isCompanyAdmin(userProfile?.role) && companyApps.length > 0) {
      return allApplications.filter(app => companyApps.includes(app.appKey));
    }
    
    // If user has specific app_access set, use that (for employees or when company apps not loaded)
    if (userData && userData.app_access && userData.app_access.length > 0) {
      return allApplications.filter(app => userData.app_access.includes(app.appKey));
    }
    
    // For global admins or fallback, show all apps
    return allApplications;
  })();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="grid grid-cols-3 gap-1 p-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-slate-400 rounded-sm"></div>
            ))}
          </div>
          <h1 className="text-3xl font-bold text-slate-100">Dashboard</h1>
        </div>
        

      </div>

      {/* Search and Controls */}
      <div className="flex justify-center">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((app) => {
          const IconComponent = app.icon;
          return (
            <div
              key={app.id}
              ref={(el) => (cardRefs.current[app.id] = el)}
              onMouseEnter={() => setHoveredCard(app.id)}
              onMouseLeave={() => {
                setHoveredCard(null);
                setMousePosition({ x: 50, y: 50 }); // Reset to center
              }}
              onMouseMove={(e) => handleMouseMove(e, app.id)}
              className="relative cursor-pointer"
              style={{
                transform: hoveredCard === app.id ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                transformOrigin: hoveredCard === app.id 
                  ? `${mousePosition.x}% ${mousePosition.y}%` 
                  : 'center center',
                transition: hoveredCard === app.id ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
              }}
              onClick={() => {
                if (app.title === 'Formulas') {
                  navigate('/formulas');
                } else if (app.title === 'Raw Materials') {
                  navigate('/raw-materials');
                        } else if (app.title === 'Suppliers') {
          navigate('/suppliers');
                }
              }}
            >
              <Card className={`p-8 hover:shadow-lg transition-all duration-300 h-full relative overflow-hidden border-2 border-transparent ${app.borderColor}`}>
                {hoveredCard === app.id && (
                  <div 
                    className="absolute inset-0 opacity-20 -z-0"
                    style={{
                      background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${app.glowColor}, transparent 70%)`
                    }}
                  />
                )}
                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                  {/* Icon Circle */}
                  <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center transition-all duration-300"
                       style={{
                         transform: hoveredCard === app.id ? 'scale(1.1)' : 'scale(1)',
                         transition: hoveredCard === app.id ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
                       }}>
                    <div className={`w-16 h-16 ${app.iconBgColor} rounded-full flex items-center justify-center`}>
                      <IconComponent className={`w-8 h-8 ${app.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl font-medium text-slate-100">{app.title}</h3>
                  
                  {/* Manage Access */}
                  <div className="space-y-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const appMap = {
                          'Formulas': 'formulas',
                          'Raw Materials': 'raw-materials',
                          'Suppliers': 'suppliers'
                        };
                        const appKey = appMap[app.title];
                        navigate(`/user-management?filterApp=${appKey}`);
                      }}
                      className="text-sm text-slate-300 hover:text-blue-400 transition-colors underline decoration-dotted hover:decoration-solid"
                    >
                      Manage Access
                    </button>
                    <div className="flex flex-col items-center space-y-2">
                      {getUsersWithAccess(app.title).slice(0, 3).map((user, index) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2 text-xs text-slate-400 transition-transform duration-300"
                          style={{
                            transform: hoveredCard === app.id ? 'scale(1.05)' : 'scale(1)',
                            transition: hoveredCard === app.id ? 'transform 0.2s ease-out' : 'transform 0.6s ease-out'
                          }}
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            app.title === 'Formulas' ? 'bg-blue-500' :
                            app.title === 'Raw Materials' ? 'bg-orange-500' :
                            'bg-fuchsia-500'
                          }`}></div>
                          <span>{user.name}</span>
                        </div>
                      ))}
                      {getUsersWithAccess(app.title).length > 3 && (
                        <div className="text-xs text-slate-500">
                          +{getUsersWithAccess(app.title).length - 3} more
                        </div>
                      )}
                      {getUsersWithAccess(app.title).length === 0 && (
                        <div className="text-xs text-slate-500">
                          No users assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
      
      {/* Enhanced User Management Table with Real-time Activity */}
      <UserManagementTable />
    </div>
  );
};

export default AdminDashboard; 