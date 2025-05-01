import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resourceReducer from './slices/resourceSlice';
import resourceRequestReducer from './slices/resourceRequestSlice';
import requestReducer from './slices/requestSlice';
import userReducer from './slices/userSlice';
import departmentReducer from './slices/departmentSlice';
import profileReducer from './slices/profileSlice';
import userManagementReducer from './slices/userManagementSlice';

const store = configureStore({
  reducer: {
    resources: resourceReducer,
    resourceRequests: resourceRequestReducer,
    auth: authReducer,
    requests: requestReducer,
    users: userReducer,
    departments: departmentReducer,
    profile: profileReducer,
    userManagement: userManagementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
