import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const ResourceCard = ({ resource }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Typography variant="h6" gutterBottom>
          {resource.name}
        </Typography>
        <Box>
          <IconButton size="small" color="primary">
            <EditIcon />
          </IconButton>
          <IconButton size="small" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography color="textSecondary" gutterBottom>
        Department: {resource.department}
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        Status: {resource.status}
      </Typography>
      <Typography color="textSecondary">
        Quantity: {resource.quantity}
      </Typography>
    </CardContent>
  </Card>
);

const Resources = () => {
  // Mock data - replace with actual API calls
  const resources = [
    {
      id: 1,
      name: 'Laptops',
      department: 'IT',
      status: 'Available',
      quantity: 25,
    },
    {
      id: 2,
      name: 'Projectors',
      department: 'CS',
      status: 'Limited',
      quantity: 10,
    },
    {
      id: 3,
      name: 'Lab Equipment',
      department: 'IOT',
      status: 'Available',
      quantity: 15,
    },
    // Add more resources as needed
  ];

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Resources</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add Resource
          </Button>
        </Box>

        <Grid container spacing={3}>
          {resources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource.id}>
              <ResourceCard resource={resource} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Resources;
