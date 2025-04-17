import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Tooltip,
  useTheme,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Apps as AppsIcon,
  Person,
  Email,
  Phone,
  Lock,
  VpnKey,
  PhotoCamera,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import path from 'path-browserify';

const Navbar = ({ onDrawerToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [appsAnchor, setAppsAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleAppsMenuOpen = (event) => {
    setAppsAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
    setAppsAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        color: 'text.primary',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      }}
    >
      <Toolbar>
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        {/* Logo */}
        <Typography
          variant="h6"
          noWrap
          component="div"
          onClick={() => navigate('/dashboard')}
          sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            alignItems: 'center', 
            color: 'primary.main', 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            letterSpacing: '-0.5px',
            cursor: 'pointer',
            '&:hover': {
              opacity: 0.8
            }
          }}
        >
          DDU RMS
        </Typography>

        <Box sx={{ flexGrow: 1 }} />

        {/* Search Icon */}
        <IconButton
          size="large"
          color="inherit"
          sx={{ mr: 2, display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <SearchIcon />
        </IconButton>

        {/* Apps Menu */}
        <IconButton
          size="large"
          color="inherit"
          onClick={handleAppsMenuOpen}
          sx={{ mr: 2 }}
        >
          <AppsIcon />
        </IconButton>
        <Menu
          anchorEl={appsAnchor}
          open={Boolean(appsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { mt: 1.5, minWidth: 200 }
          }}
        >
          <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
            Dashboard
          </MenuItem>
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <VpnKey fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { navigate('/resources'); handleMenuClose(); }}>
            Resources
          </MenuItem>
          <MenuItem onClick={() => { navigate('/users/management'); handleMenuClose(); }}>
            Users
          </MenuItem>
        </Menu>

        {/* Notifications */}
        <IconButton
          size="large"
          color="inherit"
          onClick={handleNotificationsOpen}
          sx={{ mr: 2 }}
        >
          <Badge badgeContent={4} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationsAnchor}
          open={Boolean(notificationsAnchor)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { mt: 1.5, minWidth: 300 }
          }}
        >
          <MenuItem>
            <Typography variant="inherit" noWrap>
              New resource request from John Doe
            </Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="inherit" noWrap>
              Resource approval pending
            </Typography>
          </MenuItem>
        </Menu>

        {/* Settings */}
        <IconButton
          size="large"
          color="inherit"
          onClick={() => navigate('/settings')}
          sx={{ mr: 2 }}
        >
          <SettingsIcon />
        </IconButton>

        {/* Profile */}
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleProfileMenuOpen}
            size="small"
          >
            <Avatar 
              sx={{ width: 32, height: 32 }}
              src={
                user?.profilePhoto 
                  ? `http://localhost:5003/uploads/profiles/${path.basename(user.profilePhoto)}` 
                  : '/default-avatar.png'
              }
              imgProps={{
                onError: (e) => {
                  console.log('Avatar image failed to load:', e.target.src);
                  e.target.src = '/default-avatar.png';
                }
              }}
            >
              {!user?.profilePhoto && (user?.fullName?.[0] || 'U')}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { 
              mt: 1.5, 
              minWidth: 200,
              '& .MuiMenuItem-root': {
                display: 'flex',
                gap: 1.5,
                py: 1.5
              }
            }
          }}
        >
          <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
            <Person fontSize="small" color="primary" />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>{user?.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
