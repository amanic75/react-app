import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    console.log('🔄 ProtectedRoute - Still loading auth state...');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
          <p className="text-slate-500 text-sm mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render protected content if authenticated
  return children;
};

export default ProtectedRoute; 