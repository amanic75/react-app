import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormulasPage from './pages/FormulasPage';
import FormulaDetailPage from './pages/FormulaDetailPage';
import SuppliersPage from './pages/SuppliersPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import RawMaterialDetailPage from './pages/RawMaterialDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';

// Component to handle scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  
  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/formulas" element={
              <PrivateRoute>
                <FormulasPage />
              </PrivateRoute>
            } />
            <Route path="/formulas/:formulaId" element={
              <PrivateRoute>
                <FormulaDetailPage />
              </PrivateRoute>
            } />
            <Route path="/suppliers" element={
              <PrivateRoute>
                <SuppliersPage />
              </PrivateRoute>
            } />
            <Route path="/raw-materials" element={
              <PrivateRoute>
                <RawMaterialsPage />
              </PrivateRoute>
            } />
            <Route path="/raw-materials/:materialId" element={
              <PrivateRoute>
                <RawMaterialDetailPage />
              </PrivateRoute>
            } />
            <Route path="/user-management" element={
              <AdminRoute>
                <UserManagementPage />
              </AdminRoute>
            } />
            <Route path="/settings" element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 