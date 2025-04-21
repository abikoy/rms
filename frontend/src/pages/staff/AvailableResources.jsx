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
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const resourceTypes = [...new Set(availableResources.map(resource => resource.type))];

  const handleRequestClick = (resource) => {
    navigate(`/staff/request-resource/${resource._id}`);
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
              {resourceTypes.map(type => (
                <MenuItem key={type} value={type}>
                  {type === 'consumable_resources' ? 'Consumable' : 'Non-Consumable'}
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
            {filteredResources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {resource.name}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography color="textSecondary" gutterBottom>
                        Type: {resource.type === 'consumable_resources' ? 'Consumable' : 'Non-Consumable'}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Status: {resource.status}
                      </Typography>
                      <Typography color="textSecondary">
                        Location: {resource.location}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button size="small" color="primary">
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="primary"
                      onClick={() => handleRequestClick(resource)}
                    >
                      Request Resource
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default AvailableResources;
