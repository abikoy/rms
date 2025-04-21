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
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import DashboardLayout from '../../components/DashboardLayout';

const TransferResources = () => {
  const dispatch = useDispatch();
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

  const transferableResources = resources.filter(resource => resource.assignedTo === user?._id);

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
        <Typography variant="h4" sx={{ mb: 4 }}>
          Transfer Resources
        </Typography>

        <Grid container spacing={3}>
          {transferableResources.map((resource) => (
            <Grid item xs={12} sm={6} md={4} key={resource._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {resource.name}
                  </Typography>
                  <Typography color="textSecondary">
                    Type: {resource.type}
                  </Typography>
                  <Typography color="textSecondary">
                    Status: {resource.status}
                  </Typography>
                  <Typography color="textSecondary">
                    Location: {resource.location}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                  <Button size="small" color="secondary">
                    Initiate Transfer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}

          {transferableResources.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" align="center">
                    You don't have any resources available for transfer.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default TransferResources;
