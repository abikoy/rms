import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Divider,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchResourceById } from '../../store/slices/resourceSlice';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ResourceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const userRole = useSelector((state) => state.auth.user?.role);

  const resource = useSelector((state) =>
    state.resources.resources.find((r) => r._id === id)
  );

  useEffect(() => {
    const loadResource = async () => {
      try {
        await dispatch(fetchResourceById(id)).unwrap();
        setLoading(false);
      } catch (error) {
        console.error('Error loading resource:', error);
        setLoading(false);
      }
    };
    loadResource();
  }, [dispatch, id]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!resource) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Resource not found
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/resources')}
            sx={{ mt: 2 }}
          >
            Back to Resources
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  const canEdit = userRole === 'admin' || resource.managerType === userRole;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/resources')}
              sx={{ mb: 2 }}
            >
              Back to Resources
            </Button>
            <Typography variant="h4" gutterBottom>
              {resource.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Serial Number: {resource.serialNumber}
            </Typography>
          </Box>
          {canEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/resources/${id}/edit`)}
            >
              Edit Resource
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Asset Type
                  </Typography>
                  <Chip
                    label={resource.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset'}
                    color={resource.type === 'non_fixed_assets' ? 'primary' : 'secondary'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
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
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Asset Class
                  </Typography>
                  <Typography variant="body1">{resource.assetClass}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{resource.location}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Price Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1">{resource.quantity}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Unit Price
                  </Typography>
                  <Typography variant="body1">
                    {resource.unitPrice?.birr || 0} Birr {resource.unitPrice?.cents || 0} Cents
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Price
                  </Typography>
                  <Typography variant="body1">
                    {resource.totalPrice?.birr || 0} Birr {resource.totalPrice?.cents || 0} Cents
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Registration Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Manager Type
                  </Typography>
                  <Chip
                    label={resource.managerType === 'ddu_asset_manager' ? 'DDU' : 'IoT'}
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Registration Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(resource.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Store Keeper
                  </Typography>
                  <Typography variant="body1">{resource.storeKeeper?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Signed: {new Date(resource.storeKeeper?.date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recipient
                  </Typography>
                  <Typography variant="body1">{resource.recipient?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Signed: {new Date(resource.recipient?.date).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Model
                  </Typography>
                  <Typography variant="body1">{resource.model || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Store No.
                  </Typography>
                  <Typography variant="body1">{resource.storeNo || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Shelf No.
                  </Typography>
                  <Typography variant="body1">{resource.shelfNo || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order No.
                  </Typography>
                  <Typography variant="body1">{resource.orderNo || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ResourceDetails;
