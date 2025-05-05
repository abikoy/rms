import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const AssignResourcePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [resource, setResource] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState('');
  const [requestId, setRequestId] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [formData, setFormData] = useState({
    requisitionDivision: '',
    requestId: '',
    items: [
      {
        description: '',
        unitOfMeasure: 'piece',
        quantity: 1,
        unitPrice: 0,
        remark: '',
        expirationDate: null
      }
    ],
    requestedBy: {
      name: '',
      department: '',
      date: new Date().toISOString().split('T')[0]
    },
    receivedBy: {
      name: '',
      department: '',
      date: new Date().toISOString().split('T')[0]
    },
    certifiedBy: {
      name: '',
      department: '',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const clearFormData = () => {
    setFormData(prev => ({
      ...prev,
      requisitionDivision: '',
      requestId: '',
      requestedBy: {
        ...prev.requestedBy,
        name: '',
        department: ''
      },
      receivedBy: {
        ...prev.receivedBy,
        name: '',
        department: ''
      },
      certifiedBy: {
        ...prev.certifiedBy,
        name: '',
        department: ''
      }
    }));
  };

  const validateRequestId = (value) => {
    const requestIdPattern = /^RR-\d{8}-\d{3}$/;
    if (!value) return '';
    if (!requestIdPattern.test(value)) {
      return 'Invalid Request ID format. Please use format: RR-YYYYMMDD-XXX (e.g., RR-20250501-001)';
    }
    return '';
  };

  const handleRequestIdChange = async (e) => {
    const value = e.target.value;
    setRequestId(value);
    
    // First validate the format
    const formatError = validateRequestId(value.trim());
    if (formatError) {
      setRequestError(formatError);
      clearFormData();
      return;
    }

    if (value.trim()) {
      await fetchRequestDetails(value);
    } else {
      setRequestError('');
      clearFormData();
    }
  };

  const fetchRequestDetails = async (reqId) => {
    setRequestLoading(true);
    setRequestError('');
    setError(null);
    try {
      // Log the request for debugging
      console.log('Fetching request details for:', reqId);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5003/api/resource-requests/${reqId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Log the response for debugging
      console.log('Request details response:', response.data);

      if (response.data.status === 'success') {
        const requestData = response.data.data;
        
        // Get the requested resource and quantity
        const requestedResource = requestData.requestedItems?.[0]?.resource;
        const requestedQuantity = requestData.requestedItems?.[0]?.quantityRequested || 1;
        
        // If we have a resource loaded, validate it matches the request
        if (resource && requestedResource && resource._id !== requestedResource._id) {
          console.log('Resource mismatch:', {
            currentResource: resource._id,
            requestedResource: requestedResource._id
          });
          setRequestError('This request is for a different resource. Please select the correct resource.');
          clearFormData();
          return;
        }
        
        // Log successful match
        console.log('Resource match successful:', {
          currentResource: resource?._id,
          requestedResource: requestedResource?._id
        });
        
        setFormData(prev => ({
          ...prev,
          requisitionDivision: requestData.department || '',
          requestId: requestData.requestNumber || '',
          items: [{
            ...prev.items[0],
            quantity: requestedQuantity, // Auto-fill the quantity from request
            description: requestData.requestedItems?.[0]?.description || ''
          }],
          requestedBy: {
            ...prev.requestedBy,
            name: requestData.requestedBy?.fullName || '',
            department: requestData.department || ''
          },
          receivedBy: {
            ...prev.receivedBy,
            name: requestData.requestedAndReceivedBy?.name || '',
            department: requestData.department || ''
          },
          certifiedBy: {
            ...prev.certifiedBy,
            name: requestData.certifiedBy?.name || '',
            department: requestData.department || ''
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      
      // Check if it's a not found error
      if (error.response?.data?.details?.notFound) {
        setRequestError(
          `Request ${error.response.data.details.requestNumber} has not been created yet. Please create the request first.`
        );
      } else {
        setRequestError(
          error.response?.data?.message || 
          'Error connecting to the server. Please try again.'
        );
      }
      
      clearFormData();
    } finally {
      setRequestLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const validateExpirationDate = (date) => {
    if (!date) return false;
    
    const inputDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return inputDate >= tomorrow;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    
    if (field === 'expirationDate') {
      // Clear any previous error
      setError(null);
      
      // Validate the expiration date
      if (!validateExpirationDate(value)) {
        setError('Expiration date must be set to a future date (at least tomorrow)');
        return;
      }
    }

    if (field === 'quantity') {
      const numValue = parseInt(value);
      if (numValue > availableQuantity) {
        setQuantityError(`Cannot assign more than available quantity (${availableQuantity}). Please enter a value between 1 and ${availableQuantity}.`);
        return;
      }
      if (numValue < 1) {
        setQuantityError('Quantity must be at least 1');
        return;
      }
      setQuantityError('');
    }

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setFormData(prevState => ({
      ...prevState,
      items: updatedItems
    }));
  };

  const handlePersonChange = (role, field, value) => {
    setFormData(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate required fields
      if (!formData.requestId || !formData.requisitionDivision) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate signatures
      if (!formData.requestedBy.name || !formData.receivedBy.name || !formData.certifiedBy.name) {
        setError('All signatures are required');
        return;
      }

      // Validate expiration date for non-fixed assets
      if (resource.type === 'non_fixed_assets' && !formData.items[0].expirationDate) {
        setError('Expiration date is required for non-fixed assets');
        return;
      }

      // Validate quantity
      const requestedQuantity = formData.items[0].quantity;
      if (requestedQuantity > availableQuantity) {
        setError(`Cannot assign more than available quantity (${availableQuantity})`);
        return;
      }

      // Filter out extra fields from items before sending
      const filteredItems = formData.items.map(item => {
        // Base fields that are always included
        const baseItem = {
          description: item.description,
          unitOfMeasure: item.unitOfMeasure,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          remark: item.remark
        };

        // Only add expirationDate for non-fixed assets
        if (resource.type === 'non_fixed_assets') {
          return { ...baseItem, expirationDate: item.expirationDate };
        }

        // For fixed assets, don't include expirationDate at all
        return baseItem;
      });

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5003/api/asset-assignments',
        {
          resourceId: id,
          requestId: formData.requestId,
          requisitionDivision: formData.requisitionDivision,
          items: filteredItems,
          requestedBy: formData.requestedBy,
          receivedBy: formData.receivedBy,
          certifiedBy: formData.certifiedBy
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.status === 'success') {
        setError(null);
        setSnackbarMessage('Resource assigned successfully!');
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/resources/assigned');
        }, 2000);
      }
    } catch (error) {
      console.error('Error assigning resource:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to assign resource');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const renderMobileItemList = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Items
      </Typography>
      {formData.items.map((item, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Unit of Measure"
                  value={item.unitOfMeasure}
                  onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  error={!!quantityError}
                  helperText={quantityError}
                  InputProps={{
                    inputProps: { min: 1, max: availableQuantity }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Unit Price"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total"
                  value={(item.quantity * item.unitPrice).toFixed(2)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remark"
                  value={item.remark}
                  onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>
              {resource?.type === 'non_fixed_assets' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Expiration Date"
                    value={item.expirationDate || ''}
                    onChange={(e) => handleItemChange(index, 'expirationDate', e.target.value)}
                    error={!!error && error.includes('expiration date')}
                    helperText={
                      error && error.includes('expiration date')
                        ? error
                        : `Minimum date: ${new Date(getTomorrowDate()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}`
                    }
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: getTomorrowDate()
                    }}
                    required
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopItemList = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>Unit of Measure</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Unit Price</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Remark</TableCell>
            {resource?.type === 'non_fixed_assets' && (
              <TableCell>Expiration Date</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <TextField
                  fullWidth
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={item.unitOfMeasure}
                  onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  error={!!quantityError}
                  helperText={quantityError}
                  InputProps={{
                    inputProps: { min: 1, max: availableQuantity }
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={(item.quantity * item.unitPrice).toFixed(2)}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </TableCell>
              <TableCell>
                <TextField
                  fullWidth
                  value={item.remark}
                  onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                  multiline
                  rows={2}
                />
              </TableCell>
              {resource?.type === 'non_fixed_assets' && (
                <TableCell>
                  <TextField
                    type="date"
                    value={item.expirationDate || ''}
                    onChange={(e) => handleItemChange(index, 'expirationDate', e.target.value)}
                    error={!!error && error.includes('expiration date')}
                    helperText={
                      error && error.includes('expiration date') 
                        ? error 
                        : `Minimum date: ${new Date(getTomorrowDate()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}`
                    }
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: getTomorrowDate()
                    }}
                    fullWidth
                    required
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5003/api/resources/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data.status === 'success') {
          const resourceData = response.data.data;
          setResource(resourceData);
          setAvailableQuantity(resourceData.quantity);
          
          // If we have a request ID, validate the resource matches
          if (requestId) {
            // Re-fetch request details to validate
            await fetchRequestDetails(requestId);
          }

          // Calculate total price in birr (including cents)
          const totalPrice = resourceData.unitPrice 
            ? resourceData.unitPrice.birr + (resourceData.unitPrice.cents / 100)
            : 0;

          // Auto-fill resource details
          setFormData(prev => ({
            ...prev,
            items: [{
              ...prev.items[0],
              description: resourceData.name,
              unitPrice: totalPrice,
              serialNumber: resourceData.serialNumber,
              assetClass: resourceData.assetClass,
              location: resourceData.location
            }]
          }));
        }
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch resource');
        setLoading(false);
      }
    };

    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        maxWidth: '100%',
        overflowX: 'auto'
      }}>
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2 
        }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/resources')}
          >
            Back to Resources
          </Button>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>Assign Resource</Typography>
        </Box>

        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" align="center" gutterBottom>
                  Fixed Asset Requisition Form (FARF)
                </Typography>
                <Typography variant="subtitle2" align="right" gutterBottom>
                  No: {resource?.serialNumber || 'N/A'}
                </Typography>
              </Grid>

              {/* Resource Details Section */}
              <Grid item xs={12}>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>Resource Details</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Serial Number"
                        value={resource?.serialNumber || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Asset Class"
                        value={resource?.assetClass || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Location"
                        value={resource?.location || ''}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Available Quantity"
                        value={availableQuantity}
                        InputProps={{ readOnly: true }}
                        variant="filled"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Request ID"
                  value={requestId}
                  onChange={handleRequestIdChange}
                  required
                  error={!!requestError}
                  helperText={requestError || "Enter the Request ID to auto-fill requester and department head details"}
                  InputProps={{
                    endAdornment: requestLoading && (
                      <CircularProgress size={20} />
                    )
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Requisition Division"
                  value={formData.requisitionDivision}
                  InputProps={{ readOnly: true }}
                  variant="filled"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose of Requisition"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  required
                  multiline
                  rows={2}
                  placeholder="Please specify the purpose of this requisition"
                />
              </Grid>

              <Grid item xs={12}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {quantityError && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {quantityError}
                  </Alert>
                )}
                
                {isMobile ? renderMobileItemList() : renderDesktopItemList()}
              </Grid>

              <Grid item xs={12} container spacing={3}>
                {/* Signature sections with responsive layout */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>Requested By:</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.requestedBy.name}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.requestedBy.department}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={formData.requestedBy.date}
                    onChange={(e) => handlePersonChange('requestedBy', 'date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>Received By:</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.receivedBy.name}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.receivedBy.department}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={formData.receivedBy.date}
                    onChange={(e) => handlePersonChange('receivedBy', 'date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" gutterBottom>Certified By (Department Head):</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.certifiedBy.name}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Department"
                    value={formData.certifiedBy.department}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={formData.certifiedBy.date}
                    onChange={(e) => handlePersonChange('certifiedBy', 'date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ 
                mt: 3, 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                '& .MuiButton-root': {
                  width: { xs: '100%', sm: 'auto' }
                }
              }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => navigate('/resources')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Submit Assignment
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>

      {/* Snackbar for success/error messages */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default AssignResourcePage;
