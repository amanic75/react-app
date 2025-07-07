import React, { useState, useRef, useEffect } from 'react';
import { FolderOpen, FlaskConical, Users, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HeaderControls = () => {
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAppsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const appMenuItems = [
    { name: 'Formulas', icon: FolderOpen, action: () => navigate('/formulas') },
    { name: 'Raw Materials', icon: FlaskConical, action: () => navigate('/raw-materials') },
    { name: 'Suppliers', icon: Users, action: () => navigate('/suppliers') }
  ];

  // Get display name from user profile or email
  const getDisplayName = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name} ${userProfile.last_name}`;
    }
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
    return 'User';
  };

  // Get role display
  const getRoleDisplay = () => {
    if (!userProfile?.role) return 'Employee';
    
    switch (userProfile.role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'nsight-admin':
        return 'NSight Admin';
      case 'employee':
      default:
        return 'Employee';
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name.charAt(0)}${userProfile.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Apps Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsAppsDropdownOpen(!isAppsDropdownOpen)}
          className="flex items-center space-x-2 text-slate-300 hover:text-slate-100 transition-colors p-2 rounded-lg hover:bg-slate-700"
        >
          <div className="grid grid-cols-3 gap-1 p-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-slate-400 rounded-sm"></div>
            ))}
          </div>
          <span className="text-sm">Apps</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAppsDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isAppsDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
            {appMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action();
                    setIsAppsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-slate-300 hover:text-slate-100 hover:bg-slate-700 transition-colors ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${index === appMenuItems.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="flex items-center space-x-2 text-slate-300">
        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-sm font-medium text-slate-200">
          {getInitials()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-slate-200">{getDisplayName()}</span>
          <span className="text-xs text-slate-400">{getRoleDisplay()}</span>
        </div>
      </div>
    </div>
  );
};

export default HeaderControls; 