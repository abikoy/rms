import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CheckCircle,
  Error,
  Info,
  AccessTime,
  NotificationsNone,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import * as notificationActions from '../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { isSocketConnected } from '../services/socketService';

const NotificationMenu = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { items: notifications = [], unreadCount = 0, loading: storeLoading, error: storeError } = 
    useSelector((state) => state.notifications) || {};
  
  console.log('Current notification state:', { notifications, unreadCount, loading: storeLoading, error: storeError });
  
  // Refresh notifications periodically and when socket disconnects
  useEffect(() => {
    console.log('Initial fetch of notifications');
    dispatch(notificationActions.fetchNotifications());

    const refreshInterval = setInterval(() => {
      if (!isSocketConnected()) {
        console.log('Socket disconnected, fetching notifications manually...');
        dispatch(notificationActions.fetchNotifications());
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      setLoading(true);
      if (!notification.read) {
        await dispatch(notificationActions.markNotificationAsRead(notification._id)).unwrap();
      }
      handleClose();
    } catch (err) {
      setError('Failed to mark notification as read');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await dispatch(notificationActions.markAllNotificationsAsRead()).unwrap();
    } catch (err) {
      setError('Failed to mark all notifications as read');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'resource_request':
        return <Info color="primary" />;
      default:
        return <Info color="action" />;
    }
  };

  const getNotificationContent = (notification) => {
    return (
      <>
        <ListItemIcon>
          {getNotificationIcon(notification.type)}
        </ListItemIcon>
        <ListItemText
          primary={notification.title}
          secondary={
            <>
              <Typography variant="body2" component="span" color="text.secondary">
                {notification.message}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </Typography>
            </>
          }
        />
      </>
    );
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ ml: 1 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '100%',
            maxWidth: 360,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          {notifications.length > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              disabled={loading || notifications.every(n => n.read)}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {storeLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                  }}
                >
                  {getNotificationContent(notification)}
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <NotificationsNone sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        )}
      </Menu>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationMenu;
