import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchResourceById, updateResource } from '../../store/slices/resourceSlice';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';

const EditResource = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const userRole = useSelector((state) => state.auth.user?.role);

  const resource = useSelector((state) =>
    state.resources.resources.find((r) => r._id === id)
  );

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    type: '',
    assetClass: '',
    model: '',
    location: '',
    status: '',
    quantity: '',
    unitPriceBirr: '',
    unitPriceCents: '',
    storeNo: '',
    shelfNo: '',
    orderNo: '',
    date: '',
    storeKeeperName: '',
    storeKeeperSignDate: '',
    recipientName: '',
    recipientSignDate: ''
  });

  useEffect(() => {
    const loadResource = async () => {
      try {
        setLoading(true);
        const result = await dispatch(fetchResourceById(id)).unwrap();
        if (!result) {
          setSnackbarMessage('Resource not found');
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          navigate('/resources');
          return;
        }
        setFormData({
          name: result.name || '',
          serialNumber: result.serialNumber || '',
          type: result.type || '',
          assetClass: result.assetClass || '',
          model: result.model || '',
          location: result.location || '',
          status: result.status || '',
          quantity: result.quantity || '',
          unitPriceBirr: result.unitPrice?.birr || '',
          unitPriceCents: result.unitPrice?.cents || '',
          storeNo: result.storeNo || '',
          shelfNo: result.shelfNo || '',
          orderNo: result.orderNo || '',
          date: result.date ? result.date.split('T')[0] : '',
          storeKeeperName: result.storeKeeper?.name || '',
          storeKeeperSignDate: result.storeKeeper?.date ? result.storeKeeper.date.split('T')[0] : '',
          recipientName: result.recipient?.name || '',
          recipientSignDate: result.recipient?.date ? result.recipient.date.split('T')[0] : ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error loading resource:', error);
        setSnackbarMessage(error.message || 'Error loading resource');
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        setTimeout(() => navigate('/resources'), 2000);
        setLoading(false);
      }
    };
    loadResource();
  }, [dispatch, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'unitPriceCents') {
      const cents = parseInt(value) || 0;
      if (cents >= 100) {
        const additionalBirr = Math.floor(cents / 100);
        const remainingCents = cents % 100;
        setFormData(prevState => ({
          ...prevState,
          unitPriceBirr: (parseInt(prevState.unitPriceBirr) || 0) + additionalBirr,
          unitPriceCents: remainingCents
        }));
        return;
      }
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const calculateTotalPrice = () => {
    const quantity = Number(formData.quantity) || 0;
    const birr = Number(formData.unitPriceBirr) || 0;
    const cents = Number(formData.unitPriceCents) || 0;

    const totalBirr = birr * quantity;
    const totalCents = cents * quantity;

    const additionalBirr = Math.floor(totalCents / 100);
    const finalCents = totalCents % 100;
    const finalBirr = totalBirr + additionalBirr;

    return {
      birr: finalBirr,
      cents: finalCents
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['name', 'serialNumber', 'type', 'assetClass', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setSnackbarMessage(`Missing required fields: ${missingFields.join(', ')}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    const totals = calculateTotalPrice();

    try {
      const resourceData = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        type: formData.type,
        assetClass: formData.assetClass,
        model: formData.model,
        location: formData.location,
        status: formData.status,
        quantity: Number(formData.quantity) || 0,
        unitPrice: {
          birr: Number(formData.unitPriceBirr) || 0,
          cents: Number(formData.unitPriceCents) || 0
        },
        totalPrice: totals,
        storeNo: formData.storeNo,
        shelfNo: formData.shelfNo,
        orderNo: formData.orderNo,
        date: formData.date,
        storeKeeper: {
          name: formData.storeKeeperName,
          date: formData.storeKeeperSignDate
        },
        recipient: {
          name: formData.recipientName,
          date: formData.recipientSignDate
        }
      };

      await dispatch(updateResource({ id, resourceData })).unwrap();
      setSnackbarMessage('Resource updated successfully');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setTimeout(() => navigate('/resources'), 1500);
    } catch (error) {
      setSnackbarMessage(error.message || 'Error updating resource');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  if (!resource && !loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="error">
            Resource not found or you don't have permission to edit it
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

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Edit Resource
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Update resource information
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Asset Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Serial Number"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Asset Type</InputLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    label="Asset Type"
                  >
                    <MenuItem value="fixed_assets">Fixed Assets</MenuItem>
                    <MenuItem value="non_fixed_assets">Non-Fixed Assets</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Asset Class"
                  name="assetClass"
                  value={formData.assetClass}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    label="Status"
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Price Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Price Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Unit Price (Birr)"
                  name="unitPriceBirr"
                  type="number"
                  value={formData.unitPriceBirr}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Unit Price (Cents)"
                  name="unitPriceCents"
                  type="number"
                  value={formData.unitPriceCents}
                  onChange={handleChange}
                  inputProps={{ min: 0, max: 99 }}
                />
              </Grid>

              {/* Store Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Store Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Store No."
                  name="storeNo"
                  value={formData.storeNo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Shelf No."
                  name="shelfNo"
                  value={formData.shelfNo}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Order No."
                  name="orderNo"
                  value={formData.orderNo}
                  onChange={handleChange}
                />
              </Grid>

              {/* Dates and Signatures */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Dates and Signatures
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Store Keeper Name"
                  name="storeKeeperName"
                  value={formData.storeKeeperName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Store Keeper Sign Date"
                  name="storeKeeperSignDate"
                  value={formData.storeKeeperSignDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Recipient Name"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Recipient Sign Date"
                  name="recipientSignDate"
                  value={formData.recipientSignDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/resources')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity={snackbarSeverity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default EditResource;
