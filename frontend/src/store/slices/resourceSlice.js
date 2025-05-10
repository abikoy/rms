import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Helper to validate token
const validateToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue({
          status: 'error',
          message: 'Authentication required'
        });
      }

      // Log request attempt
      console.log('Fetching resources...');

      // Make request
      const response = await axios.get(`${API_URL}/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Log response
      console.log('Server response:', {
        status: response.status,
        success: response.data?.status === 'success',
        count: response.data?.data?.length || 0
      });

      // Validate response
      if (!response.data?.status || !Array.isArray(response.data?.data)) {
        throw new Error('Invalid server response');
      }

      return response.data;
    } catch (error) {
      // Log error details
      console.error('Request failed:', {
        type: error.name,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Handle specific error cases
      if (error.message === 'No authentication token found') {
        return rejectWithValue({
          status: 'error',
          message: 'Please login to view resources'
        });
      }

      if (error.response?.status === 401) {
        return rejectWithValue({
          status: 'error',
          message: 'Your session has expired. Please login again.'
        });
      }
      
      if (error.response?.status === 403) {
        return rejectWithValue({
          status: 'error',
          message: error.response.data?.message || 'You do not have permission to view resources'
        });
      }

      // Handle all other errors
      return rejectWithValue({
        status: 'error',
        message: error.response?.data?.message || 'Failed to fetch resources'
      });
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return rejectWithValue({
          status: 'fail',
          message: 'Invalid resource ID format'
        });
      }

      const config = getAuthHeader();
      const response = await axios.get(`${API_URL}/resources/${id}`, config);

      if (response.data.status === 'success') {
        return response.data.data;
      }

      return rejectWithValue({
        status: response.data.status || 'fail',
        message: response.data.message || 'Failed to fetch resource'
      });
    } catch (error) {
      if (error.message === 'No authentication token found') {
        return rejectWithValue({ message: 'Please login to view resource details' });
      }

      return rejectWithValue({
        status: error.response?.data?.status || 'error',
        message: error.response?.data?.message || error.message || 'Failed to fetch resource'
      });
    }
  }
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (resourceData, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.post(`${API_URL}/resources`, resourceData, config);
      
      // Handle successful response
      if (response.data) {
        // If response already has the correct format, return it
        if (response.data.status === 'success' && response.data.data) {
          return response.data;
        }
        
        // If response is just the resource data, wrap it
        return {
          status: 'success',
          data: response.data
        };
      }
      
      return rejectWithValue({
        status: 'error',
        message: 'No data received from server'
      });
    } catch (error) {
      if (error.message === 'No authentication token found') {
        return rejectWithValue({ 
          status: 'error',
          message: 'Please login to create resources' 
        });
      }
      
      // Get the error message from the response
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create resource';
      
      return rejectWithValue({
        status: 'error',
        message: errorMessage
      });
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, resourceData }, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.put(`${API_URL}/resources/${id}`, resourceData, config);
      
      if (response.data.status === 'success') {
        return { id, ...response.data.data };
      }
      
      return rejectWithValue(response.data);
    } catch (error) {
      if (error.message === 'No authentication token found') {
        return rejectWithValue({ message: 'Please login to update resources' });
      }
      
      return rejectWithValue(error.response?.data || { 
        status: 'error',
        message: error.message 
      });
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id, { rejectWithValue }) => {
    try {
      const config = getAuthHeader();
      const response = await axios.delete(`${API_URL}/resources/${id}`, config);
      return { id, ...response.data };
    } catch (error) {
      if (error.message === 'No authentication token found') {
        return rejectWithValue({ message: 'Please login to delete resources' });
      }
      
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  resources: [],
  isLoading: false,
  error: null,
  selectedResource: null
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setSelectedResource: (state, action) => {
      state.selectedResource = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch resources
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.status === 'success') {
          state.resources = action.payload.data || [];
          state.error = null;
        } else {
          state.resources = [];
          state.error = action.payload.message || 'Failed to fetch resources';
        }
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch resources';
        state.resources = [];
      })
      // Fetch resource by id
      .addCase(fetchResourceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.resources.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        } else {
          state.resources.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || action.error?.message || 'Failed to fetch resource';
      })
      // Create resource
      .addCase(createResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResource.fulfilled, (state, action) => {
        state.isLoading = false;
        // Any data we receive in fulfilled case is considered success
        state.resources.push(action.payload.data);
        state.error = null;
      })
      .addCase(createResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to create resource';
      })
      // Update resource
      .addCase(updateResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.resources.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.resources[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update resource';
      })
      // Delete resource
      .addCase(deleteResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = state.resources.filter(resource => resource._id !== action.payload.id);
        state.error = null;
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete resource';
      });
  }
});

export const { setSelectedResource, clearError } = resourceSlice.actions;
export default resourceSlice.reducer;
