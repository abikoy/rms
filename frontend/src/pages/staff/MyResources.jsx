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
  Chip,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchResources } from '../../store/slices/resourceSlice';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  InventoryOutlined as InventoryIcon,
  AddCircleOutline as RequestIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

const MyResources = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { resources = [], loading } = useSelector(state => state.resources || {});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchResources());
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter resources to only show those assigned to the current user
  const assignedResources = resources.filter(resource => 
    resource.assignedTo === user?._id && resource.status === 'assigned'
  );

  if (isLoading) {
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
        {/* Header Section with Request Button */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            gap: 2,
          }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                My Resources
              </Typography>
              <Typography color="textSecondary">
                View and manage your assigned resources
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RequestIcon />}
              onClick={() => navigate('/staff/request-resource')}
              sx={{ 
                minWidth: 200,
                height: 48,
                fontWeight: 600,
                boxShadow: 2,
              }}
            >
              Request a Resource
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Resources Display Section */}
        {assignedResources.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <InventoryIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              No Resources Assigned
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3, maxWidth: 600 }}>
              You currently have no resources assigned to you. To request resources, please use the button above.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {assignedResources.map((resource) => (
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
                    position: 'relative',
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {resource.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CategoryIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                        <Typography color="textSecondary">
                          Type: {resource.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
                        <Typography color="textSecondary">
                          Location: {resource.location}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip 
                      label={resource.managerType === 'ddu_asset_manager' ? 'DDU Asset' : 'IoT Asset'}
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: resource.managerType === 'ddu_asset_manager' ? 'info.light' : 'success.light',
                      }}
                    />
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-start', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary"
                      onClick={() => {/* Add view details handler */}}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="secondary"
                      onClick={() => {/* Add transfer request handler */}}
                    >
                      Request Transfer
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

export default MyResources;
