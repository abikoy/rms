import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';

// Theme and Store
import theme from './theme';
import store from './store';

// Pages
import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AssetManagerDashboard from './pages/dashboard/AssetManagerDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import TechnicalTeamDashboard from './pages/dashboard/TechnicalTeamDashboard';
import SchoolDeanDashboard from './pages/dashboard/SchoolDeanDashboard';
import DepartmentHeadDashboard from './pages/dashboard/DepartmentHeadDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserRegistration from './pages/admin/UserRegistration';
import Resources from './pages/admin/Resources';
import ResourceDetails from './pages/admin/ResourceDetails';
import EditResource from './pages/admin/EditResource';
import Settings from './pages/admin/Settings';
import Profile from './pages/common/Profile';
import TransferResources from './pages/resources/TransferResources';
import AddIoTAsset from './pages/asset-managers/iot/AddIoTAsset';
import AddDDUAsset from './pages/asset-managers/ddu/AddDDUAsset';
import MyResources from './pages/staff/MyResources';
import AvailableResources from './pages/staff/AvailableResources';
import ResourceRequestForm from './pages/staff/ResourceRequestForm';
import StaffSettings from './pages/staff/Settings';
import DepartmentResources from './pages/department-head/DepartmentResources';
import PendingRequests from './pages/department-head/PendingRequests';

// School Dean Pages
import Requests from './pages/school-dean/Requests';
import SchoolDeanPendingRequests from './pages/school-dean/PendingRequests';
import RequestHistory from './pages/school-dean/RequestHistory';
import SchoolResources from './pages/school-dean/SchoolResources';
import SchoolDeanAvailableResources from './pages/school-dean/AvailableResources';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const allowedRoles = ['system_admin', 'ddu_asset_manager', 'iot_asset_manager'];
  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const StaffRoute = ({ children }) => {
  const auth = useSelector((state) => state.auth);
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const allowedRoles = ['staff'];
  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppContent = () => {
  const auth = useSelector((state) => state.auth);
  
  // Function to get the appropriate dashboard based on user role
  const getDashboardComponent = () => {
    switch (auth.user?.role) {
      case 'system_admin':
        return <AdminDashboard />;
      case 'ddu_asset_manager':
      case 'iot_asset_manager':
        return <AssetManagerDashboard />;
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

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/resources/transfer" element={<TransferResources />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute>{getDashboardComponent()}</ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/users/management" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/users/registration" element={<AdminRoute><UserRegistration /></AdminRoute>} />
      <Route path="/resources" element={<AdminRoute><Resources /></AdminRoute>} />
      <Route path="/resources/:id" element={<AdminRoute><ResourceDetails /></AdminRoute>} />
      <Route path="/resources/:id/edit" element={<AdminRoute><EditResource /></AdminRoute>} />
      <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
      <Route path="/asset-managers/iot/add" element={<AdminRoute><AddIoTAsset /></AdminRoute>} />
      <Route path="/asset-managers/ddu/add" element={<AdminRoute><AddDDUAsset /></AdminRoute>} />

      {/* Staff Routes */}
      <Route path="/staff/dashboard" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
      <Route path="/staff/my-resources" element={<StaffRoute><MyResources /></StaffRoute>} />
      <Route path="/staff/available-resources" element={<StaffRoute><AvailableResources /></StaffRoute>} />
      <Route path="/staff/request-resource" element={<StaffRoute><ResourceRequestForm /></StaffRoute>} />
      <Route path="/staff/transfer-resources" element={<StaffRoute><TransferResources /></StaffRoute>} />
      <Route path="/staff/settings" element={<StaffRoute><StaffSettings /></StaffRoute>} />

      {/* Department Head Routes */}
      <Route path="/department-head/dashboard" element={<ProtectedRoute><DepartmentHeadDashboard /></ProtectedRoute>} />
      <Route path="/department-head/resources" element={<ProtectedRoute><DepartmentResources /></ProtectedRoute>} />
      <Route path="/department-head/pending-requests" element={<ProtectedRoute><PendingRequests /></ProtectedRoute>} />
      <Route path="/department-head/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* School Dean Routes */}
      <Route path="/school-dean/dashboard" element={<ProtectedRoute><SchoolDeanDashboard /></ProtectedRoute>} />
      <Route path="/school-dean/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      <Route path="/school-dean/pending-requests" element={<ProtectedRoute><PendingRequests /></ProtectedRoute>} />
      <Route path="/school-dean/request-history" element={<ProtectedRoute><RequestHistory /></ProtectedRoute>} />
      <Route path="/school-dean/school-resources" element={<ProtectedRoute><SchoolResources /></ProtectedRoute>} />
      <Route path="/school-dean/available-resources" element={<ProtectedRoute><AvailableResources /></ProtectedRoute>} />
      <Route path="/school-dean/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
