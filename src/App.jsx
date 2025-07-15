import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import './utils/clearMockData'; // Clear mock data on app start
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import FormulasPage from './pages/FormulasPage';
import FormulaDetailPage from './pages/FormulaDetailPage';
import SuppliersPage from './pages/SuppliersPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import RawMaterialDetailPage from './pages/RawMaterialDetailPage';
import UserManagementPage from './pages/UserManagementPage';
import SettingsPage from './pages/SettingsPage';
import SystemHealthPage from './pages/SystemHealthPage';
import AppDetailPage from './pages/AppDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/formulas" element={
              <ProtectedRoute>
                <FormulasPage />
              </ProtectedRoute>
            } />
            <Route path="/formulas/:formulaId" element={
              <ProtectedRoute>
                <FormulaDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <SuppliersPage />
              </ProtectedRoute>
            } />
            <Route path="/raw-materials" element={
              <ProtectedRoute>
                <RawMaterialsPage />
              </ProtectedRoute>
            } />
            <Route path="/raw-materials/:materialId" element={
              <ProtectedRoute>
                <RawMaterialDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/system-health" element={
              <ProtectedRoute>
                <SystemHealthPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/apps/:appId" element={
              <ProtectedRoute>
                <AppDetailPage />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            {/* Redirect old login route to new auth route */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 