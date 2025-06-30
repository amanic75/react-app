import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth.jsx';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FormulasPage from './pages/FormulasPage';
import FormulaDetailPage from './pages/FormulaDetailPage';
import SuppliersPage from './pages/SuppliersPage';
import RawMaterialsPage from './pages/RawMaterialsPage';
import UserManagementPage from './pages/UserManagementPage';

// Component to handle scroll restoration
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
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
          <Route path="/user-management" element={
            <AdminRoute>
              <UserManagementPage />
            </AdminRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 