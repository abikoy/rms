import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';
import { Email, Phone, LocationOn } from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a237e',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography variant="body2">
                Dire Dawa University
                <br />
                P.O. Box 1362
                <br />
                Dire Dawa, Ethiopia
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ mr: 1 }} />
              <Typography variant="body2">
                Tel: +251-25-111-1399
                <br />
                Fax: +251-25-111-5250
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 1 }} />
              <Typography variant="body2">
                Email: info@ddu.edu.et
              </Typography>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Link href="https://www.ddu.edu.et/" color="inherit" sx={{ display: 'block', mb: 1 }}>
              University Website
            </Link>
            <Link href="https://www.ddu.edu.et/academics" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Academic Programs
            </Link>
            <Link href="https://www.ddu.edu.et/research" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Research
            </Link>
            <Link href="https://www.ddu.edu.et/library" color="inherit" sx={{ display: 'block', mb: 1 }}>
              Library
            </Link>
            <Link href="https://www.ddu.edu.et/student-life" color="inherit" sx={{ display: 'block' }}>
              Student Life
            </Link>
          </Grid>

          {/* About DDU */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              About DDU
            </Typography>
            <Typography variant="body2" paragraph>
              Dire Dawa University is one of Ethiopia's premier institutions of higher education, 
              committed to excellence in teaching, research, and community service.
            </Typography>
            <Typography variant="body2">
              Established in 2006 E.C., DDU has grown to become a center of academic excellence,
              fostering innovation and preparing leaders for the future.
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            © {new Date().getFullYear()} Dire Dawa University. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
