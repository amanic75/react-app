import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../components/shared/AdminDashboard';
import EmployeeDashboard from '../components/shared/EmployeeDashboard';
import NsightAdminDashboard from '../components/shared/NsightAdminDashboard';

const DashboardPage = () => {
  const { user, userProfile, loading } = useAuth();
  const [error, setError] = useState(null);
  const [profileRetryCount, setProfileRetryCount] = useState(0);



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

  // If user is authenticated but no profile exists, show profile setup
  if (user && !userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-white mb-4">Welcome!</h2>
            <p className="text-slate-300 mb-4">
              Setting up your profile... This usually takes a few moments.
            </p>
            <p className="text-slate-400 text-sm mb-4">
              Your account: {user.email}
            </p>
            {profileRetryCount < 3 ? (
              <button 
                onClick={() => {
                  setProfileRetryCount(prev => prev + 1);
                  window.location.reload();
                }} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                Retry ({profileRetryCount + 1}/3)
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-red-400 text-sm">Profile creation failed. Please contact support.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If no user at all, this shouldn't happen in a protected route
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Authentication Error</h2>
            <p className="text-slate-300 mb-4">
              You are not logged in. Please refresh and try again.
            </p>
            <button 
              onClick={() => window.location.href = '/auth'} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }



  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    try {
      // Normalize the role value (trim whitespace and handle case)
      const role = userProfile?.role?.trim() || 'Employee';
      
      switch (role) {
        case 'Capacity Admin':
          return <AdminDashboard />;
        case 'NSight Admin':
          return <NsightAdminDashboard />;
        case 'Employee':
          return <EmployeeDashboard />;
        default:
          return <EmployeeDashboard />;
      }
    } catch (error) {
      // console.error removed
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