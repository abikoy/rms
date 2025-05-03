import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resourceReducer from './slices/resourceSlice';
import requestReducer from './slices/requestSlice';
import userReducer from './slices/userSlice';
import userManagementReducer from './slices/userManagementSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    resources: resourceReducer,
    requests: requestReducer,
    users: userReducer,
    userManagement: userManagementReducer,
    notifications: notificationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export default store;
