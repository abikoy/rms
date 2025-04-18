import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpoints } from '../../config/api';

// Set up axios interceptors for token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(endpoints.auth.register, userData);
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(error.response.data);
      }
      return rejectWithValue({ message: error.message || 'Network error occurred' });
    }
  }
);

// Get pending users
export const getPendingUsers = createAsyncThunk(
  'auth/getPendingUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.admin.pendingUsers);
      console.log('Pending users response:', response.data);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      console.error('Error fetching pending users:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Get approved users
export const getApprovedUsers = createAsyncThunk(
  'auth/getApprovedUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(endpoints.admin.approvedUsers);
      console.log('Approved users response:', response.data);
      if (response.data.success) {
        return response.data;
      }
      return rejectWithValue(response.data);
    } catch (error) {
      console.error('Error fetching approved users:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  'auth/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${endpoints.admin.users}/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(endpoints.auth.login, {
        email,
        password
      });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    localStorage.removeItem('token');
    return null;
  }
);

// Set up axios interceptor for auth
const setupAxiosInterceptors = (token) => {
  // Remove existing interceptors
  axios.interceptors.request.clear();
  axios.interceptors.response.clear();

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      if (token) {
        // Set both header types for compatibility
        config.headers['x-auth-token'] = token;
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear auth state on 401
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth: { token } } = getState();
      setupAxiosInterceptors(token);

      const response = await axios.get(endpoints.auth.user);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const { auth: { token } } = getState();
      setupAxiosInterceptors(token);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'x-auth-token': token
        }
      };

      const response = await axios.put(endpoints.auth.profile, profileData, config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      }
      if (error.response?.status === 400) {
        return rejectWithValue(error.response.data.message || 'Invalid input data');
      }
      if (error.response?.status === 500) {
        console.error('Server error:', error.response.data);
        return rejectWithValue('Server error. Please try again.');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state:', err);
  }
};

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    const token = localStorage.getItem('token'); // Get token separately

    if (serializedState === null) {
      return {
        token: token || null,
        user: null,
        isAuthenticated: !!token,
        loading: false,
        error: null,
        registrationSuccess: false
      };
    }

    const state = JSON.parse(serializedState);
    // Ensure token is always in sync
    state.token = token || null;
    state.isAuthenticated = !!token;
    return state;
  } catch (err) {
    console.error('Error loading auth state:', err);
    const token = localStorage.getItem('token');
    return {
      token: token || null,
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      pendingUsers: [],
      approvedUsers: [],
      usersLoading: false,
      registrationSuccess: false
    };
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  pendingUsers: [],
  approvedUsers: [],
  usersLoading: false,
  loading: false,
  error: null,
  registrationSuccess: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    }
  },
  extraReducers: (builder) => {
    // Get pending users
    builder
      .addCase(getPendingUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getPendingUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.pendingUsers = action.payload.users || [];
        state.error = null;
      })
      .addCase(getPendingUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.pendingUsers = [];
        state.error = action.payload?.message || 'Error fetching pending users';
      })

    // Get approved users
    builder
      .addCase(getApprovedUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(getApprovedUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.approvedUsers = action.payload.users || [];
        state.error = null;
      })
      .addCase(getApprovedUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.approvedUsers = [];
        state.error = action.payload?.message || 'Error fetching approved users';
      })

    // Update user status
    builder
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        state.pendingUsers = state.pendingUsers.filter(user => user._id !== updatedUser._id);
        if (updatedUser.status === 'approved') {
          state.approvedUsers.push(updatedUser);
        }
      })
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.registrationSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
        state.registrationSuccess = false;
      })
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
        // Save state on login
        saveState({
          token: action.payload.token,
          user: action.payload.user,
          isAuthenticated: true,
          loading: false,
          error: null,
          registrationSuccess: false
        });
        // Set up axios interceptors when user logs in
        setupAxiosInterceptors(action.payload.token);
        state.redirectTo = '/dashboard';
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        // Clear saved state on logout
        localStorage.removeItem('authState');
        state.redirectTo = null;
      })
      // Fetch user cases
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
        // Save updated state to localStorage
        saveState({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loading: false,
          error: null,
          registrationSuccess: false
        });
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Failed to fetch user';
        if (action.payload === 'Session expired. Please login again.') {
          state.isAuthenticated = false;
          state.token = null;
          state.user = null;
          localStorage.removeItem('token');
          localStorage.removeItem('authState');
        }
      })
      // Update user cases
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // Log the received user data
        console.log('Received updated user data:', action.payload.user);

        // Update user data
        state.user = {
          ...state.user,
          ...action.payload.user
        };

        // Save updated state to localStorage
        const updatedState = {
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          loading: false,
          error: null,
          registrationSuccess: false
        };

        // Save to localStorage
        saveState(updatedState);

        // Force a re-render by updating the state
        Object.assign(state, updatedState);

        // Log the final state
        console.log('Final state after update:', state.user);
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload || 'Server error. Please try again.';
      });
  }
});

export const { clearError, clearRegistrationSuccess } = authSlice.actions;
export default authSlice.reducer;
