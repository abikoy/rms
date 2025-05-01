import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Update profile information
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/api/profile/update', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Upload profile photo
export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (photoFile, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const response = await axios.post('/api/profile/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  message: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = 'Profile updated successfully';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update profile';
      })
      // Upload Photo
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.message = 'Profile photo updated successfully';
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload photo';
      });
  },
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
