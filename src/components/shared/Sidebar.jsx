import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Code,
  Building2,
  Atom
} from 'lucide-react';
import Logo from '../ui/Logo';

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { signOut, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log('Navigating to:', path);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const employeeLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', action: () => handleNavigation('/dashboard') }
  ];

  const adminLinks = [
    ...employeeLinks,
    { icon: Atom, label: 'Chemformation', action: () => console.log('Chemformation - No dedicated page yet') },
    { icon: Users, label: 'User Management', action: () => handleNavigation('/user-management') },
    { icon: Activity, label: 'System Health', action: () => handleNavigation('/system-health') }
  ];

  const nsightAdminLinks = [
    { icon: LayoutDashboard, label: 'NSight Dashboard', action: () => handleNavigation('/dashboard') },
    { icon: Code, label: 'Developer Tools', action: () => console.log('Developer Tools clicked') },
    { icon: Building2, label: 'Company Management', action: () => console.log('Company Management clicked') },
    { icon: Users, label: 'Global User Management', action: () => console.log('Global User Management clicked') },
    { icon: Activity, label: 'Platform Health', action: () => console.log('Platform Health clicked') }
  ];

  const getLinks = () => {
    if (!userProfile) return employeeLinks;
    
    console.log('Sidebar - User Role:', userProfile.role); // Debug log
    
    switch (userProfile.role) {
      case 'Capacity Admin':
        return adminLinks;
      case 'NSight Admin':
        return nsightAdminLinks;
      case 'Employee':
      default:
        return employeeLinks;
    }
  };

  const links = getLinks();

  return (
    <div 
      className={`bg-slate-800 border-r border-slate-600 h-screen flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Toggle Button */}
      <div className={`h-16 px-4 border-b border-slate-600 flex items-center justify-between ${isCollapsed ? 'px-2' : ''}`}>
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="text-lg font-semibold text-slate-100">Menu</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded-md transition-colors duration-200"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link, index) => (
            <li key={index}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked:', link.label);
                  link.action();
                }}
                className="flex items-center w-full px-3 py-2 text-slate-200 hover:bg-slate-700 
                         rounded-md transition-colors duration-200 group relative text-left"
                title={isCollapsed ? link.label : ''}
              >
                <link.icon className={`h-5 w-5 text-slate-400 group-hover:text-slate-200 ${
                  isCollapsed ? 'mx-auto' : 'mr-2'
                }`} />
                {!isCollapsed && (
                  <span className="transition-opacity duration-200 flex-1 text-left whitespace-nowrap overflow-hidden text-ellipsis">{link.label}</span>
                )}
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-slate-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {link.label}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Bottom Section with Settings and Logout */}
      <div className="border-t border-slate-600">
        {/* Settings */}
        <div className="p-4 pb-2">
          <button
            onClick={() => handleNavigation('/settings')}
            className="flex items-center w-full px-3 py-2 text-slate-200 hover:bg-slate-700 
                     rounded-md transition-colors duration-200 group relative"
            title={isCollapsed ? 'Settings' : ''}
          >
            <Settings className={`h-5 w-5 text-slate-400 group-hover:text-slate-200 ${
              isCollapsed ? 'mx-auto' : 'mr-2'
            }`} />
            {!isCollapsed && (
              <span className="transition-opacity duration-200">Settings</span>
            )}
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-slate-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
        </div>
        
        {/* Logout */}
        <div className="p-4 pt-0">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-slate-200 hover:bg-slate-700 
                     rounded-md transition-colors duration-200 group relative"
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut className={`h-5 w-5 text-slate-400 group-hover:text-slate-200 ${
              isCollapsed ? 'mx-auto' : 'mr-2'
            }`} />
            {!isCollapsed && (
              <span className="transition-opacity duration-200">Logout</span>
            )}
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-700 text-slate-200 text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 