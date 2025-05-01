import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { fetchResources } from '../../store/slices/resourceSlice';
import DashboardLayout from '../../components/DashboardLayout';

const DepartmentResources = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { resources = [], loading, error } = useSelector((state) => state.resources);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchResources()).unwrap();
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    };
    loadData();
  }, [dispatch]);

  // Filter resources for department
  const departmentResources = resources.filter(resource => 
    resource.department === user?.department
  );

  // Apply filters and search
  const filteredResources = departmentResources.filter(resource => {
    const matchesSearch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Department Resources
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            label="Search Resources"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={filterType}
              label="Asset Type"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="fixed_assets">Fixed Assets</MenuItem>
              <MenuItem value="non_fixed_assets">Non-Fixed Assets</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              label="Status"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="assigned">Assigned</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {filteredResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {resource.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Serial Number: {resource.serialNumber}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={resource.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset'}
                      color={resource.type === 'non_fixed_assets' ? 'primary' : 'secondary'}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={resource.status}
                      color={
                        resource.status === 'available'
                          ? 'success'
                          : resource.status === 'assigned'
                          ? 'warning'
                          : 'error'
                      }
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary">
                    Location: {resource.location}
                  </Typography>
                  {resource.assignedTo && (
                    <Typography color="textSecondary">
                      Assigned To: {resource.assignedTo}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
          {filteredResources.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No resources found matching your criteria.
              </Alert>
            </Grid>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default DepartmentResources;
