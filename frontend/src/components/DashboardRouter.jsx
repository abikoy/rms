import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import StaffDashboard from '../pages/dashboard/StaffDashboard';
import DepartmentHeadDashboard from '../pages/dashboard/DepartmentHeadDashboard';
import SchoolDeanDashboard from '../pages/dashboard/SchoolDeanDashboard';
import AssetManagerDashboard from '../pages/dashboard/AssetManagerDashboard';
import TechnicalTeamDashboard from '../pages/dashboard/TechnicalTeamDashboard';

const DashboardRouter = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'system_admin':
      return <AdminDashboard />;
    case 'ddu_asset_manager':
    case 'iot_asset_manager':
      return <AssetManagerDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'technical_team':
      return <TechnicalTeamDashboard />;
    case 'department_head':
      return <DepartmentHeadDashboard />;
    case 'school_dean':
      return <SchoolDeanDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default DashboardRouter;
