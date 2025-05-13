import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Container,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import ResourceCard from '../../components/ResourceCard';
import axios from 'axios';

const SchoolResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5003/api/asset-assignments/school-resources', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setResources(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (resource) => {
    // TODO: Implement return functionality
    console.log('Return resource:', resource);
  };

  const handleToggleStatus = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5003/api/asset-assignments/${assignmentId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setSuccessMessage(response.data.message);
        // Refresh the resources list
        fetchResources();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle resource status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleTransfer = (resourceId) => {
    // Handle transfer logic
    console.log('Transfer resource:', resourceId);
  };

  // Group identical resources and combine their quantities
  const groupedResources = resources.reduce((groups, resource) => {
    const serialNumber = resource.resource?.serialNumber;
    if (!serialNumber) return groups;

    if (!groups[serialNumber]) {
      groups[serialNumber] = {
        ...resource,
        items: [...(resource.items || [])],
        assignedAt: resource.assignedAt,
        assignedBy: resource.assignedBy,
        resource: {
          ...resource.resource,
          quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      };
    } else {
      // Merge items arrays
      groups[serialNumber].items.push(...(resource.items || []));
      // Update total quantity
      groups[serialNumber].resource.quantity = 
        groups[serialNumber].items.reduce((total, item) => total + item.quantity, 0) || 0;
      // Keep latest assignment date
      if (new Date(resource.assignedAt) > new Date(groups[serialNumber].assignedAt)) {
        groups[serialNumber].assignedAt = resource.assignedAt;
        groups[serialNumber].assignedBy = resource.assignedBy;
      }
    }
    return groups;
  }, {});

  // Convert grouped resources back to array
  const mergedResources = Object.values(groupedResources);

  // Filter resources based on search and type
  const filteredResources = mergedResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.resource?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.resource?.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = typeFilter === 'all' || 
      resource.resource?.type === (typeFilter === 'fixed' ? 'fixed_assets' : 'non_fixed_assets');
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const currentPageResources = filteredResources.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600 }}>
            School Resources
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {/* Search and Filter Section */}
          <Paper 
            elevation={2}
            sx={{ 
              p: 3, 
              mb: 3,
              background: (theme) => theme.palette.background.paper
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter by Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Filter by Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="fixed">Fixed Assets</MenuItem>
                    <MenuItem value="non-fixed">Non-Fixed Assets</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Resources Grid */}
          <Grid container spacing={3}>
            {currentPageResources.map((resource) => (
              <Grid item xs={12} sm={6} lg={4} key={resource.resource.serialNumber}>
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  onReturn={() => handleReturn(resource._id)}
                  onTransfer={() => handleTransfer(resource._id)}
                  onToggleStatus={handleToggleStatus}
                  userRole="school_dean"
                />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {filteredResources.length === 0 && !error && (
            <Alert 
              severity="info" 
              sx={{ 
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100px'
              }}
            >
              No resources found matching your criteria.
            </Alert>
          )}

          {/* Pagination */}
          {filteredResources.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default SchoolResources;
