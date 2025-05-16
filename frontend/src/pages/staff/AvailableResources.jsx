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
import DashboardLayout from '../../components/DashboardLayout';
import {
  SearchOffOutlined as NoResourcesIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Check for success message in sessionStorage
    const message = sessionStorage.getItem('requestSuccess');
    if (message) {
      setSuccessMessage(message);
      sessionStorage.removeItem('requestSuccess');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (!user || !localStorage.getItem('token')) {
          setErrorMessage('Please log in to view available resources');
          return;
        }

        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Present' : 'Missing');

        const response = await fetch('http://localhost:5003/api/asset-assignments/staff-available-resources', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch resources');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setResources(data.data);
        } else {
          setErrorMessage(data.message || 'Failed to load resources');
        }
      } catch (error) {
        console.error('Error loading resources:', error);
        setErrorMessage(error.message || 'Failed to load resources');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleRequestResource = (resource) => {
    try {
      // Format the resource data properly
      const resourceData = {
        resourceId: resource.resource._id,
        name: resource.resource.name,
        description: resource.resource.description || '',
        unitOfMeasure: resource.resource.unitOfMeasure || '',
        price: resource.resource.price || { birr: 0, cents: 0 },
        source: resource.source,
        assignedBy: resource.assignedBy,
        requestType: resource.source.type
      };
      
      console.log('Sending resource data:', resourceData); // Debug log
      localStorage.setItem('selectedResource', JSON.stringify(resourceData));
      navigate('/staff/request-resource');
    } catch (error) {
      console.error('Error handling request:', error);
      setErrorMessage('Failed to process resource request');
    }
  };

  const renderResourceCard = (resource) => {
    return (
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
              {resource.resource.name}
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Type:</strong> {formatField(resource.resource.type)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Unit Price:</strong> {formatPrice(resource.resource.unitPrice)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Status:</strong> {formatField(resource.resource.status)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Quantity:</strong> {resource.items?.reduce((total, item) => total + item.quantity, 0) || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Source:</strong> {resource.source.type === 'school' ? 'School' : 'Department'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>{resource.source.type === 'school' ? 'School' : 'Department'}:</strong> {resource.source.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Assigned To:</strong> {resource.source.assignedTo}
              </Typography>
            </Box>

            {resource.resource.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {resource.resource.description}
              </Typography>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, pt: 0 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => handleRequestResource(resource)}
            >
              Request Resource
            </Button>
          </CardActions>
        </Card>
      </Grid>
    );
  };

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

  // Filter for only available resources
  const availableResources = resources.filter(resource => 
    resource && resource.resource && resource.resource.status === 'available'
  );

  // Define available resource types
  const RESOURCE_TYPES = [
    { value: 'fixed_assets', label: 'Fixed Asset' },
    { value: 'non_fixed_assets', label: 'Non-Fixed Asset' }
  ];

  const filteredResources = availableResources.filter(resource => {
    if (!resource || !resource.resource || !resource.source) return false;
    
    const matchesSearch = searchQuery === '' || (
      resource.resource.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.resource.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.source.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesType = filterType === 'all' || resource.resource.type === filterType;
    return matchesSearch && matchesType;
  });

  if (filteredResources.length === 0) {
    return (
      <DashboardLayout>
        <Container maxWidth="lg">
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Available Resources
            </Typography>
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
                  : "There are currently no resources assigned to your school/department available for request."}
              </Typography>
            </Paper>
          </Box>
        </Container>
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

        <Grid container spacing={3}>
          {filteredResources.map(resource => renderResourceCard(resource))}
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default AvailableResources;