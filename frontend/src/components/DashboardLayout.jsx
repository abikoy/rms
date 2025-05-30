import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const drawerWidth = 250;

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useSelector(state => state.auth);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar onDrawerToggle={handleDrawerToggle} />
      <Sidebar 
        open={mobileOpen} 
        onClose={handleDrawerToggle}
        variant={isSmallScreen ? 'temporary' : 'permanent'}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: '#f8f9fa',
          overflow: 'auto',
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, sm: `${drawerWidth}px` }
        }}
      >
        <Toolbar /> {/* Add spacing below navbar */}
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
