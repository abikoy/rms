import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';

const TechnicalTeamDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const stats = [
    { 
      title: 'Assigned Tasks', 
      value: '8',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/tasks')
    },
    { 
      title: 'Pending Repairs', 
      value: '5',
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/repairs')
    },
    { 
      title: 'Completed Tasks', 
      value: '23',
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/completed')
    },
    { 
      title: 'Available Tools', 
      value: '15',
      icon: <BuildIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/tools')
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Technical Team Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Welcome back, {user?.fullName}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                }}
                onClick={stat.action}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Tasks
                  </Typography>
                  <Button variant="contained" color="primary" onClick={() => navigate('/tasks')}>
                    View All Tasks
                  </Button>
                </Box>
                {/* Add tasks list here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Equipment Status
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => navigate('/equipment')}>
                    View Details
                  </Button>
                </Box>
                {/* Add equipment status here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </DashboardLayout>
  );
};

export default TechnicalTeamDashboard;
