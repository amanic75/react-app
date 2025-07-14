import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/shared/Sidebar';
import ChatBot from '../components/shared/ChatBot';
import HeaderControls from '../components/shared/HeaderControls';

const DashboardLayout = ({ children, onMaterialAdded }) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  
  // Start collapsed for non-dashboard pages
  const shouldStartCollapsed = location.pathname !== '/dashboard';
  const [isCollapsed, setIsCollapsed] = useState(shouldStartCollapsed);

  // Update collapsed state when navigating to different pages
  useEffect(() => {
    if (location.pathname !== '/dashboard') {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  // Global activity tracking for all authenticated users
  useEffect(() => {
    const trackUserActivity = async () => {
      if (userProfile?.email) {
        try {
          // Use correct API base URL for development vs production
          const apiUrl = import.meta.env.DEV || window.location.hostname === 'localhost'
            ? 'http://localhost:3001/api/track-activity'
            : '/api/track-activity';
            
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: userProfile.email,
              userName: `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || userProfile.email.split('@')[0],
              userRole: userProfile.role || 'Employee',
              page: location.pathname,
              timestamp: new Date().toISOString()
            }),
          });

          if (!response.ok) {
            console.warn('Failed to track user activity:', response.status);
          }
        } catch (error) {
          console.warn('Error tracking user activity:', error);
        }
      }
    };

    // Track activity when component mounts or location changes
    trackUserActivity();

    // Set up heartbeat to track activity every 30 seconds
    const heartbeatInterval = setInterval(trackUserActivity, 30000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [userProfile, location.pathname]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Global Header */}
      <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-end px-6 sticky top-0 z-40">
        <HeaderControls />
      </header>
      
      <div className="flex flex-1">
        <Sidebar 
          isCollapsed={isCollapsed} 
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        />
        <main 
          className={`flex-1 p-8 transition-all duration-300 overflow-x-auto`}
          style={{ 
            marginLeft: isCollapsed ? '80px' : '256px',
            minHeight: 'calc(100vh - 64px)', // Subtract header height
            position: 'relative'
          }}
        >
          {children}
        </main>
      </div>
      <ChatBot onMaterialAdded={onMaterialAdded} />
    </div>
  );
};

export default DashboardLayout; 