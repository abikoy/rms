import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const drawerWidth = 240;

const StaffSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/staff/dashboard',
      section: 'main'
    },
    {
      text: 'My Resources',
      icon: <InventoryIcon />,
      path: '/staff/my-resources',
      section: 'main'
    },
    {
      text: 'Available Resources',
      icon: <InventoryIcon />,
      path: '/staff/available-resources',
      section: 'main'
    },
    {
      text: 'Transfer Resources',
      icon: <SwapHorizIcon />,
      path: '/staff/transfer-resources',
      section: 'main'
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/staff/settings',
      section: 'bottom'
    },
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      path: '/logout',
      section: 'bottom'
    }
  ];

  const handleClick = (path) => {
    if (path === '/logout') {
      dispatch(logout());
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const drawer = (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          Staff Portal
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.filter(item => item.section === 'main').map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleClick(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        {menuItems.filter(item => item.section === 'bottom').map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleClick(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit',
                '& .MuiTypography-root': {
                  fontWeight: location.pathname === item.path ? 600 : 400
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          backgroundColor: '#ffffff',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default StaffSidebar;
