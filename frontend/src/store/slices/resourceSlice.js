import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

// Async thunks
export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/resources`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      // Validate MongoDB ID format
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return rejectWithValue({
          status: 'fail',
          message: 'Invalid resource ID format'
        });
      }

      const response = await axios.get(`${API_URL}/resources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.status === 'success') {
        return response.data.data;
      }

      return rejectWithValue({
        status: response.data.status || 'fail',
        message: response.data.message || 'Failed to fetch resource'
      });
    } catch (error) {
      console.log('Error fetching resource:', error.response?.data || error);
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
      console.log('Making API request with data:', resourceData);
      const response = await axios.post(`${API_URL}/resources`, resourceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async ({ id, resourceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/resources/${id}`, resourceData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.data.status === 'success') {
        return { id, ...response.data.data };
      }
      return rejectWithValue(response.data);
    } catch (error) {
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
      const response = await axios.delete(`${API_URL}/resources/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return { id, ...response.data };
    } catch (error) {
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
        state.resources = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch resources';
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
        state.resources.push(action.payload);
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
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete resource';
      });
  }
});

export const { setSelectedResource, clearError } = resourceSlice.actions;
export default resourceSlice.reducer;
