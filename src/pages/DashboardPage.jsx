import React from 'react';
import { useAuth } from '../lib/auth.jsx';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminDashboard from '../components/shared/AdminDashboard';
import EmployeeDashboard from '../components/shared/EmployeeDashboard';
import NsightAdminDashboard from '../components/shared/NsightAdminDashboard';

const DashboardPage = () => {
  const { role, userData } = useAuth();

  const renderDashboard = () => {
    switch (role) {
      case 'admin':
        return <AdminDashboard userData={userData} />;
      case 'nsight-admin':
        return <NsightAdminDashboard userData={userData} />;
      case 'employee':
      default:
        return <EmployeeDashboard userData={userData} />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default DashboardPage; 