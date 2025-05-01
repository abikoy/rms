import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const AvailableResources = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Available Resources</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Resource Catalog</Typography>
              <Typography variant="body1">
                Browse and request resources available for allocation to your school.
              </Typography>
              {/* Add resource catalog and request functionality here */}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Resource Categories</Typography>
              <Typography variant="body1">
                View resources by category and check their availability status.
              </Typography>
              {/* Add resource categories and filtering here */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default AvailableResources;
