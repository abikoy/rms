import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Link,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../../store/slices/authSlice';

function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { redirectTo } = useSelector((state) => state.auth);

  React.useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo);
    }
  }, [redirectTo, navigate]);
  const { isLoading, error } = useSelector(state => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(formData));
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
          {/* Left side - Login form */}
          <Box
            sx={{
              flex: { xs: '1', md: '1' },
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
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                color: 'text.secondary',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Sign in to continue to DDU RMS
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Email"
                name="email"
                autoComplete="username"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: { xs: 2, md: 3 } }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: { xs: 2, md: 3 } }}
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
                disabled={isLoading}
              >
                Sign In
              </Button>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: { xs: 1, sm: 0 }
              }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
                <Link
                  component={RouterLink}
                  to="/signup"
                  variant="body2"
                  sx={{ textDecoration: 'none' }}
                >
                  Don't have an account? Sign Up
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
              DDU Resource Management
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Manage university resources efficiently
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

export default Login;
