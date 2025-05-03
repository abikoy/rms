import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config';
import store from '../store';
import { addNotification, updateUnreadCount } from '../store/slices/notificationSlice';

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initializeSocket = (token) => {
  if (socket) {
    console.log('Cleaning up existing socket connection...');
    socket.disconnect();
  }

  console.log('Initializing socket with API URL:', API_BASE_URL);
  
  socket = io(API_BASE_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully');
    reconnectAttempts = 0;
    // Get user ID from Redux store
    const userId = store.getState().auth.user?._id;
    if (userId) {
      console.log('Joining user room:', userId);
      socket.emit('join', { userId });
    }
  });

  socket.on('joined_rooms', (rooms) => {
    console.log('Joined rooms:', rooms);
  });

  socket.on('notification', (notification) => {
    console.log('Received notification:', notification);
    if (notification && notification._id) {
      store.dispatch(addNotification(notification));
      // Update unread count after adding notification
      store.dispatch(updateUnreadCount());
    } else {
      console.error('Invalid notification received:', notification);
    }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached');
      socket.disconnect();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try to reconnect
      socket.connect();
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Socket reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_attempt', () => {
    console.log('Attempting to reconnect...');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
    reconnectAttempts = 0;
  }
};

export const getSocket = () => socket;

export const isSocketConnected = () => {
  return socket?.connected || false;
};
