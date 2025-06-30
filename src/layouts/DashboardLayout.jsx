import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import Sidebar from '../components/shared/Sidebar';
import ChatBot from '../components/shared/ChatBot';
import HeaderControls from '../components/shared/HeaderControls';

const DashboardLayout = ({ children }) => {
  const { role } = useAuth();
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

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Global Header */}
      <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center justify-end px-6 sticky top-0 z-40">
        <HeaderControls />
      </header>
      
      <div className="flex flex-1">
        <Sidebar 
          role={role} 
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
      <ChatBot />
    </div>
  );
};

export default DashboardLayout; 