import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Footer from '../../components/common/Footer';

function Landing() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(45deg,rgb(227, 228, 230) 30%,rgb(249, 251, 253) 90%)',
      }}
    >
      <Box
        component="header"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color:'black'
        }}
      >
        <Typography variant="h6">DDU RMS</Typography>
        <Box>
          <Button
            color="inherit"
            onClick={() => navigate('/login')}
            sx={{ mr: 2 }}
          >
            LOGIN
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/signup')}
          >
            SIGN UP
          </Button>
        </Box>
      </Box>

      <Container
        maxWidth="md"
        sx={{
          textAlign: 'center',
          pt: 8,
          pb: 8,
        }}
      >
        <Box
          component="main"
          sx={{
            py: 8,
            textAlign: 'center',
            flex: 1
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: '#1a237e',
                fontWeight: 700,
                mb: 3
              }}
            >
              Dire Dawa University
            </Typography>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ 
                color: '#283593',
                fontWeight: 600,
                mb: 4
              }}
            >
              Resource Management System
            </Typography>
            <Typography 
              variant="h6" 
              paragraph
              sx={{ 
                color: '#424242',
                mb: 4,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Efficiently manage and track university resources with our comprehensive system.
              Streamline operations, improve accountability, and enhance resource utilization.
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                mt: 4,
                py: 2,
                px: 6,
                fontSize: '1.1rem'
              }}
            >
              Get Started
            </Button>

            <Grid container spacing={6} sx={{ mt: 8 }}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, height: '100%', boxShadow: 1 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: '#1a237e',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Resource Tracking
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ color: '#424242' }}
                  >
                    Track and manage all university resources in real-time with comprehensive monitoring and reporting.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, height: '100%', boxShadow: 1 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: '#1a237e',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    Asset Management
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ color: '#424242' }}
                  >
                    Efficiently manage and maintain university assets with our advanced tracking and maintenance system.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 4, bgcolor: 'white', borderRadius: 2, height: '100%', boxShadow: 1 }}>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: '#1a237e',
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    User Roles
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ color: '#424242' }}
                  >
                    Role-based access control ensures secure resource management with proper authorization levels.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Container>

      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          position: 'fixed',
          bottom: 0,
          width: '100%'
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Dire Dawa University Resource Management System
        </Typography>
      </Box>
    </Box>
  );
}

export default Landing;
