import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import path from 'path-browserify';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { updateUser, fetchUser } from '../../store/slices/authSlice';
import DashboardLayout from '../../components/DashboardLayout';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePhoto: null,
    previewUrl: null
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // Update form data when user data changes
  useEffect(() => {
    // Fetch fresh user data on component mount
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        profilePhoto: null,
        previewUrl: null
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        profilePhoto: file,
        previewUrl: previewUrl
      }));
    }
  };

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (formData.previewUrl) {
        URL.revokeObjectURL(formData.previewUrl);
      }
    };
  }, [formData.previewUrl]);

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (!formData.fullName || !formData.fullName.trim()) {
        throw new Error('Name is required');
      }

      // Prepare update data
      const submitData = new FormData();

      // Handle fullName
      submitData.append('fullName', formData.fullName.trim());
      
      // Log the form data being sent
      console.log('Form data being sent:', {
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: formData.phone,
        hasPhoto: !!formData.profilePhoto
      });
      
      // Handle profile photo
      if (formData.profilePhoto) {
        submitData.append('profilePhoto', formData.profilePhoto);
      }

      // Handle email
      const trimmedEmail = formData.email?.trim();
      if (!trimmedEmail) {
        throw new Error('Email is required');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        throw new Error('Invalid email format');
      }
      submitData.append('email', trimmedEmail);

      // Handle phone
      const trimmedPhone = formData.phone?.trim() || '';
      submitData.append('phoneNumber', trimmedPhone);

      // Handle password change
      if (showPasswordFields) {
        if (!formData.currentPassword) {
          throw new Error('Current password is required');
        }
        if (!formData.newPassword) {
          throw new Error('New password is required');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        submitData.append('currentPassword', formData.currentPassword);
        submitData.append('newPassword', formData.newPassword);
      }

      setSnackbar({
        open: true,
        message: 'Updating profile...',
        severity: 'info'
      });

      console.log('Submitting profile update:', submitData);
      const result = await dispatch(updateUser(submitData));
      
      if (result.error) {
        const errorMessage = result.payload?.message || result.payload || 'Failed to update profile';
        throw new Error(errorMessage);
      }
      
      // Reset form to user data after successful update
      const updatedUser = result.payload.user;
      setFormData(prev => ({
        ...prev,
        fullName: updatedUser.fullName || '',
        email: updatedUser.email || '',
        phone: updatedUser.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profilePhoto: null
      }));
      setIsEditing(false);
      setShowPasswordFields(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Profile update error:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update profile',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
    setIsEditing(false);
    setShowPasswordFields(false);
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Profile Header */}
              <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" component="h2">
                  Profile Information
                </Typography>
                <IconButton 
                  onClick={() => setIsEditing(!isEditing)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Grid>

              {/* Avatar Section */}
              <Grid item xs={12} sm={4} display="flex" flexDirection="column" alignItems="center">
                <label htmlFor="profile-photo">
                  <input
                    accept="image/*"
                    id="profile-photo"
                    name="profilePhoto"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={!isEditing}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    disabled={!isEditing}
                  >
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mb: 2,
                        cursor: isEditing ? 'pointer' : 'default',
                        '&:hover': isEditing ? {
                          opacity: 0.8,
                          boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                        } : {}
                      }}
                      src={
                        formData.previewUrl ||
                        (user?.profilePhoto 
                          ? `http://localhost:5003/uploads/profiles/${path.basename(user.profilePhoto)}` 
                          : '/default-avatar.png')
                      }
                      alt={user?.fullName}
                      imgProps={{
                        onError: (e) => {
                          console.log('Avatar image failed to load, using fallback');
                          e.target.src = '/default-avatar.png';
                        }
                      }}
                    />
                  </IconButton>
                </label>
                <Typography variant="subtitle1" gutterBottom>
                  {user?.role}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {user?.department}
                </Typography>
              </Grid>

              {/* Profile Form */}
              <Grid item xs={12} sm={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      type="email"
                      helperText={isEditing ? 'Leave unchanged if you don\'t want to update email' : ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </Grid>
                  
                  {isEditing && (
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        onClick={() => setShowPasswordFields(!showPasswordFields)}
                        sx={{ mb: 2 }}
                      >
                        {showPasswordFields ? 'Cancel Password Change' : 'Change Password'}
                      </Button>
                    </Grid>
                  )}

                  {showPasswordFields && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          helperText="Minimum 6 characters"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          error={formData.newPassword !== formData.confirmPassword}
                          helperText={formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : ''}
                        />
                      </Grid>
                    </>
                  )}
                  
                  {/* Action Buttons */}
                  {isEditing && (
                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                      <Button 
                        variant="outlined" 
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;
