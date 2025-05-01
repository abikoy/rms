import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';

const SchoolResources = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>School Resources</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Resource Overview</Typography>
              <Typography variant="body1">
                Manage and view all resources allocated to your school.
              </Typography>
              {/* Add school resources management functionality here */}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Department Allocations</Typography>
              <Typography variant="body1">
                View resource allocations across different departments.
              </Typography>
              {/* Add department allocation details here */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default SchoolResources;
