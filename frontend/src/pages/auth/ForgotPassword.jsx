import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Paper,
  Alert,
  Link,
  useTheme,
  useMediaQuery,
  Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Email, Phone } from '@mui/icons-material';

function ForgotPassword() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const [method, setMethod] = useState('email');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
    setContact('');
  };

  const handleContactChange = (event) => {
    setContact(event.target.value);
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value !== '' && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSendOtp = async () => {
    // Validate contact info
    if (!contact) {
      setError(`Please enter your ${method}`);
      return;
    }

    if (method === 'email' && !/\S+@\S+\.\S+/.test(contact)) {
      setError('Please enter a valid email address');
      return;
    }

    if (method === 'phone' && !/^\d{10}$/.test(contact)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // TODO: Implement API call to send OTP
      setIsOtpSent(true);
      setError('');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete OTP');
      return;
    }

    try {
      // TODO: Implement API call to verify OTP
      // If successful, redirect to reset password page
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg,rgb(221, 223, 226) 30%,rgb(227, 232, 238) 90%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 }
      }}
    >
      <Container maxWidth={isMobile ? 'sm' : 'md'}>
        <Box
          sx={{
            p: { xs: 3, sm: 4, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            backgroundColor: '#fff',
            minHeight: isMobile ? 'auto' : '600px',
            boxShadow: 3
          }}
        >
          {!isOtpSent ? (
            <>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="Forgot Password"
                sx={{
                  width: '100%',
                  maxWidth: { xs: 300, sm: 400, md: 500 },
                  height: { xs: 150, sm: 200, md: 250 },
                  objectFit: 'cover',
                  borderRadius: 3,
                  mb: { xs: 3, md: 4 }
                }}
              />
              <Typography 
                variant={isMobile ? 'h4' : 'h3'} 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Forgot Password?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: 'text.secondary', 
                  textAlign: 'center',
                  px: { xs: 2, sm: 4 }
                }}
              >
                Select how you want to receive the OTP
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}

              <FormControl 
                component="fieldset" 
                sx={{ 
                  mb: 3, 
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '80%', md: '60%' }
                }}
              >
                <FormLabel component="legend">Verification Method</FormLabel>
                <RadioGroup
                  row
                  name="verification-method"
                  value={method}
                  onChange={handleMethodChange}
                  sx={{
                    justifyContent: 'center',
                    gap: { xs: 2, sm: 4 }
                  }}
                >
                  <FormControlLabel
                    value="email"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email />
                        <span>Email</span>
                      </Box>
                    }
                  />
                  <FormControlLabel
                    value="phone"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone />
                        <span>Phone</span>
                      </Box>
                    }
                  />
                </RadioGroup>
              </FormControl>

              <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: '80%', md: '60%' } }}>
                <TextField
                  fullWidth
                  label={method === 'email' ? 'Email Address' : 'Phone Number'}
                  type={method === 'email' ? 'email' : 'tel'}
                  value={contact}
                  onChange={handleContactChange}
                  placeholder={method === 'email' ? 'Enter your email' : 'Enter your phone number'}
                  sx={{ mb: 3 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleSendOtp}
                  sx={{ 
                    mb: 2,
                    py: { xs: 1.5, md: 2 }
                  }}
                >
                  Send OTP
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="OTP Verification"
                sx={{
                  width: '100%',
                  maxWidth: { xs: 250, sm: 300, md: 400 },
                  height: { xs: 125, sm: 150, md: 200 },
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: { xs: 2, md: 3 }
                }}
              />
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                gutterBottom
                sx={{ textAlign: 'center' }}
              >
                OTP Verification
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  color: 'text.secondary', 
                  textAlign: 'center',
                  px: { xs: 2, sm: 4 }
                }}
              >
                Enter the OTP sent to {method === 'email' ? 'your email' : 'your phone'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                  {error}
                </Alert>
              )}

              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 2 },
                  mb: 3,
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {[0, 1, 2, 3].map((index) => (
                  <TextField
                    key={index}
                    id={`otp-${index}`}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    variant="outlined"
                    inputProps={{
                      maxLength: 1,
                      style: { 
                        fontSize: isMobile ? '1.5rem' : '2.5rem',
                        padding: isMobile ? '1rem' : '1.5rem',
                        width: isMobile ? '3rem' : '4rem',
                        textAlign: 'center'
                      }
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ 
                width: '100%', 
                maxWidth: { xs: '100%', sm: '80%', md: '60%' }
              }}>
                <Button
                  fullWidth
                  variant="contained"
                  size={isMobile ? 'medium' : 'large'}
                  onClick={handleVerifyOtp}
                  sx={{ 
                    mb: 3,
                    py: { xs: 1.5, md: 2 }
                  }}
                >
                  Verify OTP
                </Button>

                <Button
                  fullWidth
                  variant="text"
                  onClick={handleSendOtp}
                  sx={{ mb: 3 }}
                >
                  Resend OTP
                </Button>
              </Box>
            </>
          )}

          <Box sx={{ 
            mt: 2, 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'center', 
            gap: { xs: 2, sm: 3 }
          }}>
            <Button
              component={RouterLink}
              to="/"
              variant="text"
              color="primary"
              sx={{ textTransform: 'none' }}
              startIcon={<span>←</span>}
            >
              Back to Home
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Back to Login
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default ForgotPassword;
