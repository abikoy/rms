import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';

const Settings = () => {
  const { user } = useSelector(state => state.auth);

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4 }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Settings
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Name"
                    defaultValue={user?.name}
                    disabled
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Email"
                    defaultValue={user?.email}
                    disabled
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Department"
                    defaultValue={user?.department?.name}
                    disabled
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Update Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Box component="form" noValidate sx={{ mt: 1 }}>
                  {/* Add notification settings here */}
                  <Typography color="textSecondary">
                    Notification settings will be available soon.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default Settings;
