import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { endpoints } from '../../config/api';

// Get pending users
export const getPendingUsers = createAsyncThunk(
  'userManagement/getPendingUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) {
        params.append('department', filters.department);
      }
      
      const response = await axios.get(`${endpoints.admin.pendingUsers}?${params.toString()}`);
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
  'userManagement/getApprovedUsers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) {
        params.append('department', filters.department);
      }
      
      const response = await axios.get(`${endpoints.admin.approvedUsers}?${params.toString()}`);
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

// Delete user
export const deleteUser = createAsyncThunk(
  'userManagement/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${endpoints.admin.users}/${userId}`);
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Update user status
export const updateUserStatus = createAsyncThunk(
  'userManagement/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${endpoints.admin.users}/${userId}/status`, { status });
      return { ...response.data, userId };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Update user
export const updateUserDetails = createAsyncThunk(
  'userManagement/updateUserDetails',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${endpoints.admin.users}/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  pendingUsers: [],
  approvedUsers: [],
  loading: false,
  error: null,
  deleteSuccess: false,
  updateSuccess: false
};

const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.deleteSuccess = false;
      state.updateSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get pending users
      .addCase(getPendingUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload.users || [];
        state.error = null;
      })
      .addCase(getPendingUsers.rejected, (state, action) => {
        state.loading = false;
        state.pendingUsers = [];
        state.error = action.payload?.message || 'Error fetching pending users';
      })

      // Get approved users
      .addCase(getApprovedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getApprovedUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedUsers = action.payload.users || [];
        state.error = null;
      })
      .addCase(getApprovedUsers.rejected, (state, action) => {
        state.loading = false;
        state.approvedUsers = [];
        state.error = action.payload?.message || 'Error fetching approved users';
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.approvedUsers = state.approvedUsers.filter(user => user._id !== action.payload.userId);
        state.deleteSuccess = true;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error deleting user';
        state.deleteSuccess = false;
      })

      // Update user status
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        if (updatedUser.status === 'approved') {
          state.pendingUsers = state.pendingUsers.filter(user => user._id !== updatedUser._id);
          state.approvedUsers.push(updatedUser);
        } else {
          state.pendingUsers = state.pendingUsers.filter(user => user._id !== updatedUser._id);
        }
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error updating user status';
        state.updateSuccess = false;
      })

      // Update user details
      .addCase(updateUserDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserDetails.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        state.approvedUsers = state.approvedUsers.map(user =>
          user._id === updatedUser._id ? updatedUser : user
        );
        state.updateSuccess = true;
        state.error = null;
      })
      .addCase(updateUserDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Error updating user';
        state.updateSuccess = false;
      });
  }
});

export const { clearSuccess, clearError } = userManagementSlice.actions;
export default userManagementSlice.reducer;
