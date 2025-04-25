import React from 'react';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';

const Requests = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Requests</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => navigate('/school-dean/pending-requests')}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Requests</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                View and manage pending resource requests from departments.
              </Typography>
              <Button variant="contained" color="primary">
                View Pending Requests
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper 
              sx={{ 
                p: 3, 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => navigate('/school-dean/request-history')}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Request History</Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Access the complete history of resource requests and their outcomes.
              </Typography>
              <Button variant="contained" color="primary">
                View Request History
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Requests;
