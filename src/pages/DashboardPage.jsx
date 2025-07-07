import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../components/shared/AdminDashboard';
import EmployeeDashboard from '../components/shared/EmployeeDashboard';
import NsightAdminDashboard from '../components/shared/NsightAdminDashboard';

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('DashboardPage - Auth State:', {
      user: user?.email,
      userProfile,
      loading
    });
  }, [user, userProfile, loading]);

  // Show loading state
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

  // Show error state if no user profile
  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Setup Required</h2>
            <p className="text-slate-300 mb-4">
              Your user profile is being set up. This usually takes a few moments.
            </p>
            <p className="text-slate-400 text-sm">
              If this persists, please contact your administrator.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Debug info (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('User Profile:', userProfile);
    console.log('User Role:', JSON.stringify(userProfile.role));
    console.log('Role Type:', typeof userProfile.role);
    console.log('Role Length:', userProfile.role?.length);
    console.log('=======================');
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    try {
      // Normalize the role value (trim whitespace and handle case)
      const role = userProfile.role?.trim();
      
      console.log('Normalized Role for Switch:', JSON.stringify(role));
      
      switch (role) {
        case 'Capacity Admin':
          console.log('Rendering AdminDashboard');
          return <AdminDashboard />;
        case 'NSight Admin':
          console.log('Rendering NsightAdminDashboard');
          return <NsightAdminDashboard />;
        case 'Employee':
          console.log('Rendering EmployeeDashboard (Employee role)');
          return <EmployeeDashboard />;
        default:
          console.log('Rendering EmployeeDashboard (Default fallback for role:', JSON.stringify(role));
          return <EmployeeDashboard />;
      }
    } catch (error) {
      console.error('Error rendering dashboard:', error);
      setError(error.message);
      return (
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-red-400 mb-4">Dashboard Error</h2>
          <p className="text-slate-300 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage; 