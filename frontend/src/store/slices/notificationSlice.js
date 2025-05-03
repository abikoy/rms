import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { getAuthHeader } from '../../utils/auth';

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching notifications...');
      const config = getAuthHeader();
      console.log('Auth header:', config);
      
      const response = await axios.get(`${API_BASE_URL}/api/notifications`, config);
      console.log('Notifications response:', response.data);
      
      if (response.data.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error.response || error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.patch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

// Mark all notifications as read
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.patch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    loading: false,
    error: null,
    unreadCount: 0,
    initialized: false
  },
  reducers: {
    addNotification(state, action) {
      // Check if notification already exists
      const exists = state.items.some(item => item._id === action.payload._id);
      if (!exists) {
        // Add notification to the beginning of the array
        state.items.unshift(action.payload);
        // Update unread count
        if (!action.payload.read) {
          state.unreadCount += 1;
        }
        // Sort notifications by date
        state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    },
    clearError(state) {
      state.error = null;
    },
    updateUnreadCount(state) {
      state.unreadCount = state.items.filter(item => !item.read).length;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
        if (!state.initialized) {
          state.items = [];
          state.unreadCount = 0;
        }
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        console.log('Notifications fetched successfully:', action.payload);
        state.loading = false;
        state.error = null;
        state.initialized = true;

        // Handle response format from the backend
        const notifications = action.payload.data || [];
        
        // Update items with new notifications
        state.items = notifications;
        
        // Sort notifications by date
        state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Recalculate unread count
        state.unreadCount = notifications.filter(n => !n.read).length;

        console.log('Updated notification state:', {
          items: state.items.length,
          unreadCount: state.unreadCount
        });
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
        // Don't clear items on error, keep existing ones
      })

      // Mark notification as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        
        // Find and update the notification
        const notification = state.items.find(item => item._id === action.meta.arg);
        if (notification && !notification.read) {
          notification.read = true;
          // Recalculate unread count
          state.unreadCount = state.items.filter(item => !item.read).length;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark notification as read';
      })

      // Mark all notifications as read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        // Mark all notifications as read
        state.items.forEach(item => {
          item.read = true;
        });
        // Reset unread count
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark all notifications as read';
      });
  }
});

export const { addNotification, clearError, updateUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;