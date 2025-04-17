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
  Group as GroupIcon,
  Assessment as AssessmentIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';

const DepartmentHeadDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const stats = [
    { 
      title: 'Department Staff', 
      value: '23',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/users')
    },
    { 
      title: 'Pending Approvals', 
      value: '8',
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=pending')
    },
    { 
      title: 'Approved Requests', 
      value: '45',
      icon: <ApprovedIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=approved')
    },
    { 
      title: 'Department Resources', 
      value: '156',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Department Head Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Department: {user?.department}
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
                    Pending Approvals
                  </Typography>
                  <Button variant="contained" color="primary" onClick={() => navigate('/requests?status=pending')}>
                    View All
                  </Button>
                </Box>
                {/* Add pending approvals table here */}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Department Analytics
                  </Typography>
                  <Button variant="outlined" color="primary" onClick={() => navigate('/analytics')}>
                    View Details
                  </Button>
                </Box>
                {/* Add department analytics chart here */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </DashboardLayout>
  );
};

export default DepartmentHeadDashboard;
