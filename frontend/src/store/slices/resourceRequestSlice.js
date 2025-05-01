import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_URL } from '../../config';
import { getAuthHeader } from '../../utils/auth';

// Create a new resource request
export const createResourceRequest = createAsyncThunk(
  'resourceRequests/createResourceRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.post(`${API_URL}/resource-requests`, requestData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  }
);

// Get all resource requests for the current user
export const fetchUserResourceRequests = createAsyncThunk(
  'resourceRequests/fetchUserResourceRequests',
  async (_, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.get(`${API_URL}/resource-requests`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
  }
);

const resourceRequestSlice = createSlice({
  name: 'resourceRequests',
  initialState: {
    requests: [],
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create resource request
      .addCase(createResourceRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResourceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests.unshift(action.payload.data);
        state.error = null;
      })
      .addCase(createResourceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create request';
      })
      // Fetch user resource requests
      .addCase(fetchUserResourceRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserResourceRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.requests = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserResourceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch requests';
      });
  }
});

export const { clearError } = resourceRequestSlice.actions;
export default resourceRequestSlice.reducer;
