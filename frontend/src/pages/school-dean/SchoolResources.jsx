import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import ResourceSidebar from '../../components/ResourceSidebar';
import axios from 'axios';

const SchoolResources = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedView, setSelectedView] = useState('all');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Resource counts for sidebar
  const [resourceCounts, setResourceCounts] = useState({
    all: 0,
    expired: 0,
    expiringSoon: 0,
    active: 0
  });

  useEffect(() => {
    fetchResources();
  }, []);

  // Update resource counts whenever resources change
  useEffect(() => {
    const now = new Date();
    const counts = {
      all: 0,
      expired: 0,
      expiringSoon: 0,
      active: 0
    };

    // Group resources by serial number first
    const groupedResources = resources.reduce((groups, resource) => {
      const serialNumber = resource.resource?.serialNumber;
      if (!serialNumber) return groups;

      if (!groups[serialNumber]) {
        groups[serialNumber] = {
          ...resource,
          items: [...(resource.items || [])],
          resource: {
            ...resource.resource
          }
        };
      } else {
        // Merge items arrays
        groups[serialNumber].items.push(...(resource.items || []));
      }
      return groups;
    }, {});

    // Count based on grouped resources
    Object.values(groupedResources).forEach(resource => {
      counts.all++; // Increment total count

      if (resource.resource?.type === 'non_fixed_assets' && resource.items?.[0]?.expirationDate) {
        const expDate = new Date(resource.items[0].expirationDate);
        const daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 0) {
          counts.expired++;
        } else if (daysUntilExpiry <= 7) {
          counts.expiringSoon++;
        } else {
          counts.active++;
        }
      } else {
        counts.active++;
      }
    });

    setResourceCounts(counts);
  }, [resources]);

  const fetchResources = async () => {
    try {
      // Only fetch resources from accepted transfers
      const response = await axios.get('http://localhost:5003/api/asset-assignments/school-resources', {
        params: {
          transferStatus: 'accepted',
          school: user.school
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

  const handleTransfer = (resource) => {
    navigate('/resources/transfer', {
      state: {
        resourceId: resource.resource._id,
        resourceSerialNumber: resource.resource.serialNumber,
        resourceName: resource.resource.name,
        fromDivision: user.school,
        quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 1,
        items: [{
          resourceId: resource.resource._id,
          resourceSerialNumber: resource.resource.serialNumber,
          assetDescription: resource.resource.name,
          quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 1
        }]
      }
    });
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
          ...resource.resource,  // Preserve all resource fields including expirationDate
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

  // Filter resources based on search query, type filter, and view
  const filteredResources = Object.values(groupedResources)
    .filter(resource => {
      const matchesSearch = resource.resource?.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      
      const matchesType =
        selectedType === 'all' ||
        (selectedType === 'fixed' && resource.resource?.type === 'fixed_assets') ||
        (selectedType === 'non-fixed' && resource.resource?.type === 'non_fixed_assets');

      // Get expiration information for non-fixed assets
      const isNonFixed = resource.resource?.type === 'non_fixed_assets';
      const hasExpirationDate = Boolean(resource.items?.[0]?.expirationDate);
      let daysUntilExpiry;

      if (isNonFixed && hasExpirationDate) {
        const now = new Date();
        const expDate = new Date(resource.items[0].expirationDate);
        daysUntilExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
      }

      // Filter based on selected view
      switch (selectedView) {
        case 'expired':
          // Show only expired non-fixed assets
          return matchesSearch && isNonFixed && hasExpirationDate && daysUntilExpiry <= 0;

        case 'expiring-soon':
          // Show only non-fixed assets expiring within 7 days
          return matchesSearch && isNonFixed && hasExpirationDate && daysUntilExpiry > 0 && daysUntilExpiry <= 7;

        case 'active':
          // Show fixed assets AND non-fixed assets with more than 7 days until expiry
          return matchesSearch && (
            (isNonFixed && hasExpirationDate && daysUntilExpiry > 7) || // Non-fixed assets with > 7 days
            (!isNonFixed) // All fixed assets
          );

        default: // 'all' view
          return matchesSearch && matchesType;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const currentPageResources = filteredResources.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            School Resources
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, minHeight: 'calc(100vh - 250px)' }}>
            <ResourceSidebar
              selectedView={selectedView}
              onViewChange={setSelectedView}
              resourceCounts={resourceCounts}
            />
            <Box sx={{ flex: 1 }}>
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
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 4 }}>
                  {error}
                </Alert>
              ) : (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
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
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Type</InputLabel>
                        <Select
                          value={selectedType}
                          label="Filter by Type"
                          onChange={(e) => setSelectedType(e.target.value)}
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="fixed">Fixed Assets</MenuItem>
                          <MenuItem value="non-fixed">Non-Fixed Assets</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  {/* Resources Grid */}
                  <Box sx={{ 
                    width: '100%',
                    px: { xs: 1, sm: 2 },
                    mx: 'auto'
                  }}>
                    <Grid 
                      container 
                      spacing={{ xs: 1, sm: 2 }}
                    >
                      {currentPageResources.map((resource) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          lg={3} 
                          key={resource.resource.serialNumber}
                          sx={{
                            display: 'flex'
                          }}
                        >
                          <ResourceCard
                            resource={resource}
                            onReturn={() => handleReturn(resource)}
                            onTransfer={() => handleTransfer(resource)}
                            onToggleStatus={handleToggleStatus}
                            userRole="school_dean"
                            sx={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '& .MuiCardContent-root': {
                                p: { xs: 1.5, sm: 2 },
                                flexGrow: 1
                              },
                              '& .MuiCardActions-root': {
                                p: { xs: 1, sm: 1.5 },
                                gap: { xs: 0.5, sm: 1 }
                              },
                              '& .MuiTypography-h6': {
                                fontSize: { xs: '1rem', sm: '1.25rem' }
                              },
                              '& .MuiTypography-body2': {
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                              },
                              '& .MuiButton-root': {
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                py: { xs: 0.5, sm: 1 }
                              }
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                  {/* Empty State */}
                  {filteredResources.length === 0 && !error && (
                    <Box 
                      sx={{ 
                        mt: { xs: 4, sm: 6, md: 8 }, 
                        textAlign: 'center',
                        p: { xs: 2, sm: 3 },
                        backgroundColor: 'background.paper',
                        borderRadius: { xs: 1, sm: 2 },
                        boxShadow: 1,
                        maxWidth: '600px',
                        mx: 'auto'
                      }}
                    >
                      <SearchIcon 
                        sx={{ 
                          fontSize: { xs: 40, sm: 50, md: 60 }, 
                          color: 'text.secondary',
                          mb: { xs: 1, sm: 2 },
                          opacity: 0.7
                        }} 
                      />
                      <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        gutterBottom
                        sx={{ 
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        No Resources Found
                      </Typography>
                      <Typography 
                        variant="body1" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {searchQuery || selectedType !== 'all' 
                          ? 'Try adjusting your search or filter criteria'
                          : 'There are currently no resources in your school'}
                      </Typography>
                    </Box>
                  )}
                  {/* Pagination */}
                  {filteredResources.length > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Pagination
                        count={Math.ceil(filteredResources.length / itemsPerPage)}
                        page={page}
                        onChange={(e, value) => setPage(value)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default SchoolResources;
