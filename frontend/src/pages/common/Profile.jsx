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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { updateUser, fetchUser } from '../../store/slices/authSlice';
import DashboardLayout from '../../components/DashboardLayout';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, isAuthenticated } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePhoto: null,
    previewUrl: null
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  // 🔐 Password visibility toggle state
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchUser());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        previewUrl: user.profilePhoto || null,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
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
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        profilePhoto: file,
        previewUrl
      }));
    }
  };

  useEffect(() => {
    return () => {
      if (formData.previewUrl) {
        URL.revokeObjectURL(formData.previewUrl);
      }
    };
  }, [formData.previewUrl]);

  const handleSubmit = async () => {
    try {
      if (!formData.fullName || !formData.fullName.trim()) {
        throw new Error('Name is required');
      }

      const submitData = new FormData();
      submitData.append('fullName', formData.fullName.trim());

      if (formData.profilePhoto) {
        const photoSize = formData.profilePhoto.size;
        if (photoSize > 5 * 1024 * 1024) {
          throw new Error('Profile photo must be less than 5MB');
        }
        submitData.append('photo', formData.profilePhoto);
      }

      const trimmedPhone = formData.phone?.trim() || '';
      if (trimmedPhone) {
        if (!/^\+?[0-9\s-()]+$/.test(trimmedPhone)) {
          throw new Error('Invalid phone number format');
        }
        submitData.append('phoneNumber', trimmedPhone);
      }

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

      setSnackbar({ open: true, message: 'Updating profile...', severity: 'info' });

      const result = await dispatch(updateUser(submitData)).unwrap();

      const updatedUser = result.user;
      setFormData(prev => ({
        ...prev,
        fullName: updatedUser.fullName || prev.fullName,
        phone: updatedUser.phoneNumber || prev.phone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        profilePhoto: null,
        previewUrl: updatedUser.profilePhoto ? `${process.env.REACT_APP_API_URL}${updatedUser.profilePhoto}` : prev.previewUrl
      }));

      dispatch(fetchUser());
      setIsEditing(false);
      setShowPasswordFields(false);
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
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

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Unable to load profile data. Please try refreshing the page.</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Profile Information</Typography>
                <IconButton onClick={() => setIsEditing(!isEditing)} color="primary">
                  <EditIcon />
                </IconButton>
              </Grid>

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
                          e.target.src = '/default-avatar.png';
                        }
                      }}
                    />
                  </IconButton>
                </label>
                <Typography variant="subtitle1" gutterBottom>{user?.role}</Typography>
                <Typography variant="body2" color="textSecondary">{user?.department}</Typography>
              </Grid>

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
                      value={user?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
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
                          type={showPassword.current ? 'text' : 'password'}
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={() => togglePasswordVisibility('current')} edge="end">
                                {showPassword.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="New Password"
                          name="newPassword"
                          type={showPassword.new ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          helperText="Minimum 6 characters"
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={() => togglePasswordVisibility('new')} edge="end">
                                {showPassword.new ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            )
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Confirm New Password"
                          name="confirmPassword"
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          error={formData.newPassword !== formData.confirmPassword}
                          helperText={formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : ''}
                          InputProps={{
                            endAdornment: (
                              <IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">
                                {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            )
                          }}
                        />
                      </Grid>
                    </>
                  )}

                  {isEditing && (
                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                      <Button variant="outlined" onClick={handleCancel} disabled={loading}>
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
