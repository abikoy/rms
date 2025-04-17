import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../store/slices/authSlice';

function SignUp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    school: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const userData = {
        ...formData,
        username: formData.email // Using email as username
      };
      delete userData.confirmPassword;
      await dispatch(register(userData)).unwrap();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg,rgb(221, 223, 226) 30%,rgb(227, 232, 238) 90%)',
        display: 'flex',
        alignItems: 'center',
        p: { xs: 2, sm: 4 }
      }}
    >
      <Container maxWidth={isMobile ? 'sm' : 'lg'}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column-reverse' : 'row',
            backgroundColor: '#fff',
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3
          }}
        >
          {/* Left side - Registration form */}
          <Box
            sx={{
              flex: { xs: '1', md: '2' },
              p: { xs: 3, sm: 4 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              component="h1" 
              gutterBottom
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            >
              Create an Account
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Join DDU Resource Management System
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="fullName"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    sx={{ mb: { xs: 1, md: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{ mb: { xs: 1, md: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="phoneNumber"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    sx={{ mb: { xs: 1, md: 2 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    sx={{ mb: { xs: 1, md: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size={isMobile ? 'small' : 'medium'}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{ mb: { xs: 1, md: 2 } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size={isMobile ? 'small' : 'medium'}
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required sx={{ mb: { xs: 1, md: 2 } }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      label="Role"
                    >
                      <MenuItem value="system_admin">System Admin</MenuItem>
                      <MenuItem value="ddu_asset_manager">DDU Asset Manager</MenuItem>
                      <MenuItem value="iot_asset_manager">IoT Asset Manager</MenuItem>
                      <MenuItem value="staff">Staff</MenuItem>
                      <MenuItem value="technical_team">Technical Team</MenuItem>
                      <MenuItem value="department_head">Department Head</MenuItem>
                      <MenuItem value="school_dean">School Dean</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {['staff', 'department_head'].includes(formData.role) && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="department"
                      label="Department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      sx={{ mb: { xs: 1, md: 2 } }}
                    />
                  </Grid>
                )}

                {formData.role === 'school_dean' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="school"
                      label="School"
                      value={formData.school}
                      onChange={handleChange}
                      required
                      sx={{ mb: { xs: 1, md: 2 } }}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size={isMobile ? 'medium' : 'large'}
                    sx={{ 
                      mt: { xs: 2, md: 3 }, 
                      mb: 2,
                      py: { xs: 1.5, md: 2 }
                    }}
                  >
                    Sign Up
                  </Button>
                </Grid>
              </Grid>

              <Box sx={{ 
                textAlign: 'center',
                mt: { xs: 2, md: 3 }
              }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Already have an account? Login
                </Link>
              </Box>
            </Box>
          </Box>

          {/* Right side - Welcome image */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#000',
              color: '#fff',
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              minHeight: isMobile ? '200px' : 'auto'
            }}
          >
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              gutterBottom
            >
              Welcome to DDU RMS
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Join our platform to manage university resources efficiently
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              color="inherit"
              sx={{ mt: { xs: 1, sm: 2 } }}
              startIcon={<span>←</span>}
              size={isMobile ? 'small' : 'medium'}
            >
              Back to Home
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default SignUp;
