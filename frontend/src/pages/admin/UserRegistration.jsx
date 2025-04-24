import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import SchoolDepartmentSelect from '../../components/SchoolDepartmentSelect';
import axios from 'axios';
import { endpoints } from '../../config/api';

const departmentRoles = ['staff', 'department_head'];
const schoolRoles = ['school_dean'];

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const shouldShowDepartment = departmentRoles.includes(formData.role);
  const shouldShowSchool = schoolRoles.includes(formData.role);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Prepare data for backend
    const dataToSend = {
      ...formData,
      status: 'approved', // Admin-created users are immediately approved
    };
    try {
      const response = await axios.post(endpoints.auth.register, dataToSend);
      if (response.data && response.data.success === false) {
        setError(response.data.message || 'Registration failed.');
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          department: '',
          role: '',
          password: '',
          confirmPassword: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      setSuccess(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          User Registration
        </Typography>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((show) => !show)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword((show) => !show)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
               
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleChange(e)}
                      label="Role"
                    >
                      <MenuItem value="system_admin">System Admin</MenuItem>
                      <MenuItem value="ddu_asset_manager">DDU Asset Manager</MenuItem>
                      <MenuItem value="iot_asset_manager">IoT Asset Manager</MenuItem>
                      <MenuItem value="technical_team">Technical Team</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="department_head">Department Head</MenuItem>
                      <MenuItem value="school_dean">School Dean</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SchoolDepartmentSelect
                    role={formData.role}
                    school={formData.school}
                    department={formData.department}
                    onSchoolChange={(value) => handleChange({ target: { name: 'school', value }})}
                    onDepartmentChange={(value) => handleChange({ target: { name: 'department', value }})}
                    required={shouldShowDepartment || shouldShowSchool}
                  />
                </Grid>
                <Grid item xs={12}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      User registered successfully!
                    </Alert>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Register User
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default UserRegistration;
