import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Paper,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchResources } from '../../store/slices/resourceSlice';
import DashboardLayout from '../../components/DashboardLayout';
import {
  SearchOffOutlined as NoResourcesIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

// Price formatting helper
const formatPrice = (price) => {
  if (!price || (!price.birr && !price.cents)) return 'N/A';
  const birr = price.birr || 0;
  const cents = price.cents || 0;
  return `${birr}.${cents.toString().padStart(2, '0')} ETB`;
};

// Field formatting helper
const formatField = (value) => {
  if (!value) return 'N/A';
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const AvailableResources = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources = [], loading } = useSelector(state => state.resources);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user || !localStorage.getItem('token')) {
        setErrorMessage('Please log in to view resources');
        return;
      }

      try {
        console.log('Fetching resources for school dean:', {
          userId: user._id,
          role: user.role,
          school: user.school
        });
        const result = await dispatch(fetchResources()).unwrap();
        console.log('Resources API response:', result);
        
        if (result.data && result.data.length > 0) {
          console.log('First resource:', result.data[0]);
        } else {
          console.log('No resources returned from API');
        }
      } catch (error) {
        console.error('Error loading resources:', error);
        setErrorMessage('Failed to load resources');
      }
    };
    loadData();
  }, [dispatch, user]);

  const handleRequestResource = (resource) => {
    try {
      const resourceData = {
        description: resource.name,
        unitOfMeasure: resource.unitOfMeasure || 'pcs',
        

        price: {
          birr: resource.price?.birr || resource.unitPrice?.birr || 0,
          cents: resource.price?.cents || resource.unitPrice?.cents || 0
        },
        resourceId: resource._id,
        managerType: resource.managerType
      };
      
      // Store resource data and navigate to request form
      localStorage.setItem('selectedResource', JSON.stringify(resourceData));
      navigate('/school-dean/request-resource');
    } catch (error) {
      console.error('Error handling request:', error);
      setErrorMessage('Failed to process resource request');
    }
  };

  // Filter for only unassigned, available, and school-specific resources
  const availableResources = resources.filter(resource => 
    !resource.assignedTo && 
    resource.status === 'available' &&
    resource.school === user.school
  );

  // Define available resource types
  const RESOURCE_TYPES = [
    { value: 'fixed_assets', label: 'Fixed Asset' },
    { value: 'non_fixed_assets', label: 'Non-Fixed Asset' },
    
  ];

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = [
      resource.name,
      resource.type,
      resource.location,
      resource.managerType,
      resource.serialNumber
    ].some(field => 
      field && field.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

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
          <Typography color="textSecondary" gutterBottom>
            Type: {formatField(resource.type)}
          </Typography>
          <Typography 
                       color="textSecondary" 
                       gutterBottom
                       sx={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: 1
                       }}
                     >
                       <strong>Manager Type:</strong> {resource.managerType ? (
                         <span style={{ color: resource.managerType === 'DDU Asset Manager' ? '#1976d2' : '#2e7d32' }}>
                           {resource.managerType}
                         </span>
                       ) : 'N/A'}
                     </Typography>
          <Typography variant="body2" gutterBottom>
            Location: {resource.location || 'N/A'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Serial Number: {resource.serialNumber || 'N/A'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Model: {resource.model || 'N/A'}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Quantity: {resource.quantity || 0}
          </Typography>
          <Typography variant="body2" gutterBottom>
            Asset Class: {formatField(resource.assetClass) || 'N/A'}
          </Typography>
          <Typography variant="body2">
          Price: {formatPrice({
                birr: resource.price?.birr || resource.unitPrice?.birr,
                cents: resource.price?.cents || resource.unitPrice?.cents
              })}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
           <Button
                       fullWidth
                       variant="contained"
                       color="primary"
                       onClick={() => handleRequestResource(resource)}
                       disabled={!resource.status || resource.status !== 'available'}
                     >
                       Request Resource
                     </Button>
          <Button
            size="small"
            color="info"
            variant="outlined"
            onClick={() => navigate(`/school-dean/resource/${resource._id}`)}
            startIcon={<i className="fas fa-info-circle" />}
          >
            Details
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

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
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {errorMessage}
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
