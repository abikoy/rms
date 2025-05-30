import { Box, Button, Container, Grid, Typography, AppBar, Toolbar, useScrollTrigger, Fade, Paper, TextField, IconButton, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';
import { useRef } from 'react';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const dduGate = "/ddu-gate.jpg"; // public path


// Scroll to Top Button Component
function ScrollTop() {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          sx={{
            borderRadius: '50%',
            minWidth: '50px',
            height: '50px',
          }}
        >
          <KeyboardArrowUpIcon />
        </Button>
      </Box>
    </Fade>
  );
}

function Landing() {
  const navigate = useNavigate();
  
  // Refs for sections
  const homeRef = useRef(null);
  const featuresRef = useRef(null);
  const servicesRef = useRef(null);
  const contactRef = useRef(null);

  // Scroll to section function
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(45deg,rgb(227, 228, 230) 30%,rgb(249, 251, 253) 90%)',
      }}
    >
      <AppBar position="sticky" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => scrollToSection(homeRef)}>
            DDU RMS
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="primary" onClick={() => scrollToSection(homeRef)}>Home</Button>
            <Button color="primary" onClick={() => scrollToSection(servicesRef)}>Services</Button>
            <Button color="primary" onClick={() => scrollToSection(contactRef)}>Contact</Button>
            
            <Box sx={{ ml: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/login')}
              >
                LOGIN
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/signup')}
              >
                SIGN UP
              </Button>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box ref={homeRef} sx={{ minHeight: '100vh', pt: 8, pb: 8 }}>
        <Container maxWidth="lg">
          <Box
            component="main"
            sx={{
              py: 8,
              textAlign: 'center',
              flex: 1
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Box
                  component="img"
                  src={dduGate}
                  alt="Dire Dawa University Gate"
                  sx={{
                    width: '100%',
                    height: '500px',
                    objectFit: 'cover',
                    borderRadius: 2,
                    mb: { xs: 4, md: 0 },
                    boxShadow: 3,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    color: '#1a237e',
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                  }}
                >
                  Streamline University Resources with crms
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ 
                    mb: 4, 
                    color: 'text.secondary',
                    lineHeight: 1.6
                  }}
                >
                  Experience seamless resource management with the crms. Efficiently track, allocate, and manage university assets with ease.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={() => navigate('/signup')}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem'
                  }}
                >
                  Get Started Now
                </Button>
              </Grid>
            </Grid>

            <Grid container spacing={6} sx={{ mt: 8 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: '50%',
                      mb: 2
                    }}
                  >
                    <InventoryIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Asset Tracking
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    Keep a real-time inventory of all university assets. Monitor usage, location, and status to ensure optimal resource allocation.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: '50%',
                      mb: 2
                    }}
                  >
                    <SecurityIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Role-Based Access
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    Provide tailored access to users based on their roles. Ensure secure and efficient management with role-specific permissions.
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 4,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: '50%',
                      mb: 2
                    }}
                  >
                    <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Request Management
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    Streamline the process of resource requests and approvals. Track requests from submission to completion with ease.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box 
        ref={featuresRef}
        sx={{ 
          minHeight: '100vh',
          py: 12,
          bgcolor: 'background.default',
          background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2"
              sx={{ 
                mb: 3,
                color: 'primary.main',
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Key Features
            </Typography>
            <Typography
              variant="h6"
              sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                mt: 3
              }}
            >
              Discover the powerful features that make our resource management system stand out
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ mb: 3, color: 'primary.main' }}>
                  <InventoryIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Smart Inventory
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Intelligent tracking system that provides real-time updates on resource availability and usage patterns.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ mb: 3, color: 'primary.main' }}>
                  <SecurityIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Secure Access
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Role-based access control ensuring resources are only accessible to authorized personnel.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 3
                  }
                }}
              >
                <Box sx={{ mb: 3, color: 'primary.main' }}>
                  <AssignmentTurnedInIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                  Easy Tracking
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                  Simplified process for tracking and managing resource requests, transfers, and maintenance.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box 
        ref={servicesRef} 
        sx={{ 
          minHeight: '100vh', 
          py: 12,
          bgcolor: 'background.paper',
          background: 'linear-gradient(180deg, #f5f5f5 0%, #ffffff 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 3,
                color: 'primary.main',
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Our Services
            </Typography>
            <Typography
              variant="h6"
              sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                mt: 3
              }}
            >
              Discover our comprehensive suite of resource management solutions
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'transparent',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: 'white',
                    boxShadow: 3
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <ManageAccountsIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Resource Management
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Comprehensive resource tracking and management system for efficient allocation and monitoring.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'transparent',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: 'white',
                    boxShadow: 3
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <TrackChangesIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Asset Tracking
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Real-time tracking and monitoring of university assets with detailed reporting.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'transparent',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    bgcolor: 'white',
                    boxShadow: 3
                  }
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      borderRadius: 2,
                      mr: 2
                    }}
                  >
                    <SystemUpdateAltIcon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Request Management
                  </Typography>
                </Box>
                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                  Streamlined process for resource requests, transfers, and approvals.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box 
        ref={contactRef} 
        sx={{ 
          minHeight: '100vh', 
          py: 12,
          bgcolor: 'grey.50',
          background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                mb: 3,
                color: 'primary.main',
                fontWeight: 700,
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2
                }
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="h6"
              sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
                mt: 3
              }}
            >
              Get in touch with us for any questions or inquiries
            </Typography>
          </Box>
          
          <Grid container spacing={6}>
            {/* University Information */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: 2
                }}
              >
                <Typography variant="h4" sx={{ color: 'primary.main', mb: 4, fontWeight: 600 }}>
                  Dire Dawa University
                </Typography>
                
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 600 }}>
                    Address
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Dire Dawa University <br />
                    P.O. Box 1362<br />
                    Dire Dawa, Ethiopia
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2, fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                    Phone: +251 25 111 0033<br />
                    Fax: +251 25 111 5050<br />
                    Email: info@ddu.edu.et
                  </Typography>
                </Box>               
              </Paper>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: '100%',
                  bgcolor: 'white',
                  borderRadius: 4,
                  boxShadow: 2
                }}
              >
                <Typography variant="h4" sx={{ color: 'primary.main', mb: 4, fontWeight: 600 }}>
                  Get in Touch
                </Typography>
                
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    variant="outlined"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    type="email"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Subject"
                    variant="outlined"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={4}
                    required
                  />
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ 
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      width: 'fit-content'
                    }}
                  >
                    Send Message
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.300',
          pt: 8,
          pb: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8}>
            {/* About Section */}
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                About DDU-RMS
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
                Dire Dawa University Resource Management System streamlines the process of managing and tracking university resources efficiently.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton
                  href="https://www.facebook.com/diredawauniversity"
                  target="_blank"
                  sx={{ color: 'grey.300', '&:hover': { color: 'primary.main' } }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  href="https://twitter.com/ddu_ethiopia"
                  target="_blank"
                  sx={{ color: 'grey.300', '&:hover': { color: 'primary.main' } }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  href="https://www.linkedin.com/school/dire-dawa-university"
                  target="_blank"
                  sx={{ color: 'grey.300', '&:hover': { color: 'primary.main' } }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Link
                    component="button"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Home
                  </Link>
                  <Link
                    component="button"
                    onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Features
                  </Link>
                  <Link
                    component="button"
                    onClick={() => servicesRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Services
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <Link
                    component="button"
                    onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Contact
                  </Link>
                  <Link
                    href="/login"
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    sx={{
                      color: 'grey.300',
                      display: 'block',
                      mb: 1.5,
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    Register
                  </Link>
                </Grid>
              </Grid>
            </Grid>

            {/* Contact Info */}
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                Contact Info
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Dire Dawa University<br />
                    P.O. Box 1362<br />
                    Dire Dawa, Ethiopia
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2">
                    +251 25 111 0033
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="body2">
                    info@ddu.edu.et
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Copyright */}
          <Box
            sx={{
              borderTop: 1,
              borderColor: 'grey.800',
              mt: 8,
              pt: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2">
              © {new Date().getFullYear()} Dire Dawa University Resource Management System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;
