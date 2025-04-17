import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Inventory as ResourcesIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  AccountCircle as ProfileIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';

const drawerWidth = 250;

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [usersOpen, setUsersOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);

  const handleUsersClick = () => {
    setUsersOpen(!usersOpen);
  };

  const dispatch = useDispatch();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Get menu items based on user role
  const getMenuItems = () => {
    const role = user?.role;

    // Common menu items for all roles
    const commonItems = [
      {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
      },
      {
        text: 'Resources',
        icon: <ResourcesIcon />,
        path: '/resources',
      },
    ];

    // Role-specific menu items
    switch (role) {
      case 'system_admin':
        return [
          ...commonItems,
          {
            text: 'Users',
            icon: <PeopleIcon />,
            subItems: [
              {
                text: 'User Management',
                icon: <GroupIcon />,
                path: '/users/management',
              },
              {
                text: 'User Registration',
                icon: <PersonAddIcon />,
                path: '/users/registration',
              },
            ],
          },
          {
            text: 'Settings',
            icon: <SettingsIcon />,
            path: '/settings',
          },
        ];
      
      case 'ddu_asset_manager':
      case 'iot_asset_manager':
      case 'school_dean':
        return [
          ...commonItems,
          {
            text: 'Transfer Resources',
            icon: <ResourcesIcon />,
            path: '/resources/transfer',
          },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', sm: variant === 'temporary' ? 'none' : 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)',
          mt: variant === 'temporary' ? 0 : 8,
          height: variant === 'temporary' ? '100%' : 'calc(100% - 64px)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Profile Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}
          alt={user?.fullName}
        >
          {user?.fullName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" sx={{ color: 'grey',fontWeight: 'medium' }}>
            {user?.fullName || 'Admin User'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(4, 68, 49, 0.7)' }}>
            {user?.role || 'Administrator'}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />

      {/* Menu Items */}
      <List sx={{ flex: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.subItems ? (
              // Parent menu item with sub-items
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleUsersClick}>
                    <ListItemIcon sx={{ color: 'grey'}}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {usersOpen ? <ExpandLess sx={{ color: 'blugrey'}}/> :<ExpandMore sx={{ color: 'blugrey'}}/>}
                  </ListItemButton>
                </ListItem>
                <Collapse in={usersOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.text}
                        sx={{
                          pl: 4,
                          minHeight: 48,
                          px: 2.5,
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          },
                          borderRadius: '8px',
                          mx: 1,
                          backgroundColor:
                            location.pathname === subItem.path
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'transparent',
                          '& .MuiListItemIcon-root': {
                            color: location.pathname === subItem.path ? 'primary.main' : 'text.secondary',
                            transition: 'color 0.2s ease-in-out',
                          },
                          '& .MuiTypography-root': {
                            color: location.pathname === subItem.path ? 'primary.main' : 'text.primary',
                            fontWeight: location.pathname === subItem.path ? 600 : 500,
                            transition: 'all 0.2s ease-in-out',
                          },
                        }}
                        onClick={() => navigate(subItem.path)}
                      >
                        <ListItemIcon>
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // Regular menu item
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '& .MuiTypography-root': {
                        color: 'primary.main',
                        fontWeight: 600,
                      },
                    },
                    borderRadius: '8px',
                    mx: 1,
                    backgroundColor:
                      location.pathname === item.path
                        ? 'rgba(25, 118, 210, 0.12)'
                        : 'transparent',
                    '& .MuiListItemIcon-root': {
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                      transition: 'color 0.2s ease-in-out',
                    },
                    '& .MuiTypography-root': {
                      color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                      fontWeight: location.pathname === item.path ? 600 : 500,
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'white' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Profile and Logout Section */}
      <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/profile')}>
            <ListItemIcon sx={{ color: 'white' }}>
              <Avatar
                sx={{ width: 28, height: 28 }}
                alt={user?.fullName}
                src={
                  user?.profilePhoto
                    ? `http://localhost:5003/uploads/profiles/${user.profilePhoto.split('/').pop()}`
                    : '/default-avatar.png'
                }
                imgProps={{
                  onError: (e) => {
                    e.target.src = '/default-avatar.png';
                  }
                }}
              >
                {!user?.profilePhoto && user?.fullName?.[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'grey'}}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
