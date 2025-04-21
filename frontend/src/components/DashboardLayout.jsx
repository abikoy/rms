import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import StaffSidebar from './staff/StaffSidebar';

const drawerWidth = 250; // Match the width from Sidebar component

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const isStaff = user?.role === 'staff';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      {isStaff ? (
        <StaffSidebar />
      ) : (
        <Sidebar 
          open={mobileOpen} 
          onClose={handleDrawerToggle}
          variant={isMobile ? 'temporary' : 'permanent'}
        />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: '#f8f9fa',
          overflow: 'auto',
          width: isStaff ? 'calc(100% - 240px)' : { sm: `calc(100% - ${drawerWidth}px)` },
          ml: isStaff ? '240px' : { sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar /> {/* Add spacing below navbar */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
