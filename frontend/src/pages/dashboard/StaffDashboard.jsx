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
  Inventory as InventoryIcon,
  History as HistoryIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const StaffDashboard = () => {
  const navigate = useNavigate();
  
  const stats = [
    { 
      title: 'Available Resources', 
      value: '45',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'My Requests', 
      value: '12',
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests')
    },
    { 
      title: 'Pending Requests', 
      value: '3',
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=pending')
    },
  ];

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4 }}>
          Staff Dashboard
        </Typography>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Requests
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate('/resources')}>
                Request Resource
              </Button>
            </Box>
            {/* Add recent requests table here */}
          </CardContent>
        </Card>
      </Container>
    </Box>
    </DashboardLayout>
  );
};

export default StaffDashboard;
