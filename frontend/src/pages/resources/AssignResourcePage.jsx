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
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

const AssignResourcePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
        remark: ''
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
        
        // Check if the request is already assigned
        if (requestData.status === 'assigned') {
          setRequestError(`Request ${reqId} has already been assigned to another resource.`);
          clearFormData();
          return;
        }

        // Update form with request data
        setFormData(prev => ({
          ...prev,
          requisitionDivision: requestData.division,
          requestId: requestData.requestId,
          requestedBy: {
            ...prev.requestedBy,
            name: requestData.requestedBy.name,
            department: requestData.requestedBy.department,
            date: new Date().toISOString().split('T')[0]
          },
          receivedBy: {
            ...prev.receivedBy,
            name: requestData.requestedBy.name, // Same as requester
            department: requestData.requestedBy.department,
            date: new Date().toISOString().split('T')[0]
          },
          certifiedBy: {
            ...prev.certifiedBy,
            name: requestData.departmentHead.name,
            department: requestData.departmentHead.department,
            date: new Date().toISOString().split('T')[0]
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    // For quantity, ensure it's not more than available
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

    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
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
      const token = localStorage.getItem('token');
      
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

      // Validate quantity
      const requestedQuantity = formData.items[0].quantity;
      if (requestedQuantity > availableQuantity) {
        setError(`Cannot assign more than available quantity (${availableQuantity})`);
        return;
      }

      // Create the request body
      const requestBody = {
        resourceId: id,
        requestId: formData.requestId,
        requisitionDivision: formData.requisitionDivision,
        items: formData.items.map(item => ({
          description: item.description,
          unitOfMeasure: item.unitOfMeasure,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          remark: item.remark || ''
        })),
        requestedBy: {
          name: formData.requestedBy.name,
          department: formData.requestedBy.department,
          date: formData.requestedBy.date
        },
        receivedBy: {
          name: formData.receivedBy.name,
          department: formData.receivedBy.department,
          date: formData.receivedBy.date
        },
        certifiedBy: {
          name: formData.certifiedBy.name,
          department: formData.certifiedBy.department,
          date: formData.certifiedBy.date
        }
      };

      setLoading(true);

      const response = await axios.post(
        'http://localhost:5003/api/asset-assignments',
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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
                
                <TableContainer sx={{ 
                  maxWidth: '100%',
                  overflowX: 'auto',
                  '& .MuiTableCell-root': {
                    whiteSpace: 'nowrap',
                    p: { xs: 1, sm: 2 }
                  }
                }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Item No</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Remark</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              value={item.description}
                              variant="filled"
                              InputProps={{ readOnly: true }}
                              sx={{ minWidth: { xs: '100px', sm: '150px' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl fullWidth variant="standard">
                              <Select
                                value={item.unitOfMeasure}
                                onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                                sx={{ minWidth: { xs: '60px', sm: '80px' } }}
                              >
                                <MenuItem value="piece">Piece</MenuItem>
                                <MenuItem value="set">Set</MenuItem>
                                <MenuItem value="unit">Unit</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                              variant="standard"
                              inputProps={{ 
                                min: 1,
                                max: availableQuantity
                              }}
                              error={item.quantity > availableQuantity || item.quantity < 1}
                              helperText={item.quantity > availableQuantity ? `Max: ${availableQuantity}` : item.quantity < 1 ? 'Min: 1' : ''}
                              sx={{ width: { xs: '60px', sm: '80px' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              value={Number(item.unitPrice || 0).toFixed(2)} 
                              variant="filled"
                              InputProps={{ 
                                readOnly: true,
                                startAdornment: <span style={{ marginRight: 8 }}>Br</span>
                              }}
                              sx={{ width: { xs: '80px', sm: '120px' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              value={item.remark}
                              onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                              variant="standard"
                              sx={{ minWidth: { xs: '100px', sm: '150px' } }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
