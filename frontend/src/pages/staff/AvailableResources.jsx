import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Dialog,
  DialogContent,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchResources } from '../../store/slices/resourceSlice';

import DashboardLayout from '../../components/DashboardLayout';
import {
  SearchOffOutlined as NoResourcesIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const AvailableResources = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources = [], loading, error } = useSelector(state => state.resources);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        if (!user || !localStorage.getItem('token')) {
          setErrorMessage('Please log in to view available resources');
          return;
        }

        const result = await dispatch(fetchResources()).unwrap();
        if (result.status !== 'success') {
          setErrorMessage(result.message || 'Failed to load resources');
        }
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load resources');
      }
    };

    loadData();
  }, [dispatch, user]);

  // Filter for only unassigned and available resources
  const availableResources = resources.filter(resource => 
    !resource.assignedTo && 
    resource.status === 'available'
  );

  // Define available resource types
  const RESOURCE_TYPES = [
    { value: 'fixed_assets', label: 'Fixed Asset' },
    { value: 'non_fixed_assets', label: 'Non-Fixed Asset' }
  ];

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRequestResource = (resource) => {
    try {
      const resourceData = {
        description: resource.name,
        unitOfMeasure: resource.unitOfMeasure || 'pcs',
        price: resource.price || 0,
        resourceId: resource._id,
        department: resource.department
      };
      
      // Save to localStorage
      localStorage.setItem('selectedResource', JSON.stringify(resourceData));
      
      // Navigate to request form
      navigate('/staff/request-resource');
    } catch (error) {
      console.error('Error saving resource data:', error);
      setErrorMessage('Failed to initiate resource request');
    }
  };

  const renderResourceCard = (resource) => (
    <Grid item xs={12} sm={6} md={4} key={resource._id}>
      <Card 
        elevation={3}
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {resource.name}
          </Typography>
          <Typography color="textSecondary" paragraph>
            Type: {resource.type || 'N/A'}
          </Typography>
          <Typography color="textSecondary" paragraph>
            Department: {resource.department || 'N/A'}
          </Typography>
          <Typography color="textSecondary" paragraph>
            Unit: {resource.unitOfMeasure || 'pcs'}
          </Typography>
          <Typography color="textSecondary" paragraph>
            Price: {resource.price ? `${resource.price} Birr` : 'N/A'}
          </Typography>
          <Typography color="textSecondary">
            Status: {resource.status || 'Available'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => handleRequestResource(resource)}
          >
            Request This Resource
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  if (!user || !localStorage.getItem('token')) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 4 }}>
            Please log in to view available resources
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {showSuccessAlert && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setShowSuccessAlert(false)}>
            Resource request submitted successfully!
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Available Resources
          </Typography>
          <Typography color="textSecondary">
            Browse and request available unassigned resources
          </Typography>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              label="Filter by Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              {RESOURCE_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {filteredResources.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <NoResourcesIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              No Available Resources
            </Typography>
            <Typography color="textSecondary" sx={{ maxWidth: 600 }}>
              {searchQuery || filterType !== 'all'
                ? "No resources match your search criteria. Try adjusting your filters."
                : "There are currently no unassigned resources available for request."}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredResources.map(resource => renderResourceCard(resource))}
          </Grid>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default AvailableResources;
