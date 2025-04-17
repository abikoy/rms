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
import StaffDashboard from './pages/dashboard/StaffDashboard';
import TechnicalTeamDashboard from './pages/dashboard/TechnicalTeamDashboard';
import SchoolDeanDashboard from './pages/dashboard/SchoolDeanDashboard';
import DepartmentHeadDashboard from './pages/dashboard/DepartmentHeadDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserRegistration from './pages/admin/UserRegistration';
import Resources from './pages/admin/Resources';
import Settings from './pages/admin/Settings';
import Profile from './pages/common/Profile';
import TransferResources from './pages/resources/TransferResources';

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

const AppContent = () => {
  const auth = useSelector((state) => state.auth);
  
  // Function to get the appropriate dashboard based on user role
  const getDashboardComponent = () => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
        <Route path="/users">
          <Route path="management" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="registration" element={<AdminRoute><UserRegistration /></AdminRoute>} />
        </Route>
        <Route path="/resources" element={<AdminRoute><Resources /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><Settings /></AdminRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
