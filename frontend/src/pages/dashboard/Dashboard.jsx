import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import StaffDashboard from './StaffDashboard';
import TechnicalTeamDashboard from './TechnicalTeamDashboard';
import SchoolDeanDashboard from './SchoolDeanDashboard';
import DepartmentHeadDashboard from './DepartmentHeadDashboard';

const Dashboard = () => {
  const auth = useSelector((state) => state.auth);

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (auth.user?.role) {
    case 'system_admin':
    case 'ddu_asset_manager':
    case 'iot_asset_manager':
      return <AdminDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'technical_team':
      return <TechnicalTeamDashboard />;
    case 'school_dean':
      return <SchoolDeanDashboard />;
    case 'department_head':
      return <DepartmentHeadDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default Dashboard;
