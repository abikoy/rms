import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/axios';

const TransferResources = () => {
  // Validation helper functions
  const isNumeric = (value) => /^\d+$/.test(value);
  const isPositiveNumber = (value) => /^\d*\.?\d+$/.test(value) && parseFloat(value) >= 0;

  // Handle cents to birr conversion
  const handlePriceChange = (index, field, value) => {
    const newItems = [...items];
    const currentItem = newItems[index];

    if (field === 'price.cents') {
      const cents = parseInt(value, 10);
      if (cents >= 100) {
        // Convert excess cents to birr
        const additionalBirr = Math.floor(cents / 100);
        const remainingCents = cents % 100;
        currentItem.price.birr = (parseInt(currentItem.price.birr, 10) || 0) + additionalBirr;
        currentItem.price.cents = remainingCents;
      } else {
        currentItem.price.cents = cents;
      }
    } else if (field === 'price.birr') {
      currentItem.price.birr = parseInt(value, 10) || 0;
    }

    setItems(newItems);
  };

  // Validation state
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Get resource data from location state
  const [formData, setFormData] = useState({
    transferNo: '',
    date: new Date().toISOString().split('T')[0],
    fromDivision: location.state?.fromDivision || (user?.role === 'school_dean' ? user?.school : user?.department) || '',
    toDivision: '',
    assetTransferorName: user?.fullName || '',
    assetTransferorDate: new Date().toISOString().split('T')[0],
    propertyHeadName: '',
    propertyHeadDate: '',
    witnessName: '',
    recipientName: '',
    fromDepartment: user?.department || '',
    toDepartment: '',
    quantity: 1,
    reason: ''
  });

  // Initialize items with resource data if available
  const [items, setItems] = useState(
    location.state?.items ? 
    location.state.items.map((item, index) => ({
      serialNo: index + 1,
      resourceId: item.resourceId,
      resourceSerialNumber: item.resourceSerialNumber,
      assetDescription: item.assetDescription,
      unitOfMeasure: 'piece',
      quantity: item.quantity,
      fainNo: '',
      fainDate: new Date().toISOString().split('T')[0],
      price: {
        birr: 0,
        cents: 0
      },
      unitPrice: 0,
      remark: ''
    })) : 
    [{
      serialNo: 1,
      resourceId: '',
      resourceSerialNumber: '',
      assetDescription: '',
      unitOfMeasure: 'piece',
      quantity: 1,
      fainNo: '',
      fainDate: new Date().toISOString().split('T')[0],
      price: {
        birr: 0,
        cents: 0
      },
      unitPrice: 0,
      remark: ''
    }]
  );

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [resources, setResources] = useState([]);

  const [departments, setDepartments] = useState([
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Electrical Engineering',
    'Mechanical Engineering'
  ]);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await api.get('/api/resources', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.status === 'success') {
        setResources(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch resources',
        severity: 'error'
      });
    }
  };

  const handleAddItem = () => {
    setItems([...items, {
      serialNo: items.length + 1,
      assetDescription: '',
      unitOfMeasure: '',
      quantity: 1,
      fainNo: '',
      fainDate: '',
      price: { birr: 0, cents: 0 },
      remark: ''
    }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      // Recalculate serial numbers
      const updatedItems = newItems.map((item, idx) => ({
        ...item,
        serialNo: idx + 1
      }));
      setItems(updatedItems);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === 'price') {
      newItems[index].price = value;
    } else {
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  // Get today's date at midnight for consistent comparison
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // Format date for input min attribute
  const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Validate transfer number
    if (!isNumeric(formData.transferNo)) {
      newErrors.transferNo = 'Transfer number must be numeric';
    }

    // Validate toDivision
    if (!formData.toDivision) {
      newErrors.toDivision = 'Destination division is required';
    }

    // Validate recipient
    if (!formData.recipientName) {
      newErrors.recipientName = 'Recipient name is required';
    }

    // Validate items
    const itemErrors = items.map(item => {
      const error = {};
      
      if (!item.resourceId) {
        error.resourceId = 'Resource ID is required';
      }

      if (!item.resourceSerialNumber) {
        error.resourceSerialNumber = 'Resource Serial Number is required';
      }

      if (!item.assetDescription) {
        error.assetDescription = 'Asset Description is required';
      }

      if (item.fainNo && !isNumeric(item.fainNo)) {
        error.fainNo = 'FAIN number must be numeric';
      }

      if (!isPositiveNumber(item.price.birr)) {
        error.priceBirr = 'Price (Birr) must be a positive number';
      }

      if (!isPositiveNumber(item.price.cents) || item.price.cents > 99) {
        error.priceCents = 'Cents must be between 0 and 99';
      }

      return Object.keys(error).length > 0 ? error : null;
    });

    if (itemErrors.some(error => error !== null)) {
      newErrors.items = itemErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Validate required fields before submission
      const hasRequiredFields = items.every(item => 
        item.resourceId && item.resourceSerialNumber && item.assetDescription
      );

      if (!hasRequiredFields) {
        setSnackbar({
          open: true,
          message: 'Please fill in all required fields for each item',
          severity: 'error'
        });
        return;
      }

      const response = await api.post('/api/transfers', {
        ...formData,
        items: items.map(item => ({
          ...item,
          resourceId: item.resourceId,
          resourceSerialNumber: item.resourceSerialNumber,
          price: {
            birr: parseFloat(item.price.birr) || 0,
            cents: parseInt(item.price.cents) || 0
          }
        }))
      });

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: 'Transfer created successfully',
          severity: 'success'
        });

        // Reset form
        setFormData({
          transferNo: '',
          date: getFormattedDate(getTodayDate()),
          fromDivision: '',
          toDivision: '',
          assetTransferorName: '',
          assetTransferorDate: '',
          propertyHeadName: '',
          propertyHeadDate: '',
          witnessName: '',
          recipientName: '',
          fromDepartment: '',
          toDepartment: '',
          quantity: 1,
          reason: ''
        });
        setItems([{
          serialNo: 1,
          resourceId: '',
          resourceSerialNumber: '',
          assetDescription: '',
          unitOfMeasure: '',
          quantity: 1,
          fainNo: '',
          fainDate: '',
          price: {
            birr: 0,
            cents: 0
          },
          remark: ''
        }]);
        setErrors({});
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      
      const errorMessage = error.response?.data?.message;
      
      // Handle specific validation errors
      if (errorMessage?.includes('transfer number is already in use')) {
        setErrors(prev => ({
          ...prev,
          transferNo: 'This transfer number is already in use. Please use a different number.'
        }));
      } else if (errorMessage?.includes('division') || errorMessage?.includes('not exist')) {
        setErrors(prev => ({
          ...prev,
          toDivision: errorMessage
        }));
      } else if (errorMessage?.includes('Recipient')) {
        setErrors(prev => ({
          ...prev,
          recipientName: errorMessage
        }));
      }
      
      setSnackbar({
        open: true,
        message: errorMessage || 'Failed to create transfer',
        severity: 'error'
      });
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom align="center">
            DDU Property Division
          </Typography>
          <Typography variant="h5" gutterBottom align="center">
            Fixed Asset Transfer Form (F.A.T.F)
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              {/* Form Header */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Transfer No"
                  value={formData.transferNo}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || isNumeric(value)) {
                      setFormData({ ...formData, transferNo: value });
                    }
                  }}
                  error={!!errors.transferNo}
                  helperText={errors.transferNo}
                  required
                  inputProps={{
                    pattern: '\\d*',
                    inputMode: 'numeric'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) => {
                    const selectedDate = new Date(e.target.value);
                    const today = getTodayDate();
                    
                    if (selectedDate < today) {
                      alert('Please select a date from today onwards');
                      return;
                    }
                    
                    setFormData({ ...formData, date: e.target.value });
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    min: getFormattedDate(new Date())
                  }}
                />
              </Grid>

              {/* From/To Division */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="From Division"
                  value={formData.fromDivision}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="To Division"
                  name="toDivision"
                  value={formData.toDivision}
                  onChange={(e) => setFormData({ ...formData, toDivision: e.target.value })}
                  required
                />
              </Grid>

              {/* Items Table */}
              <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ mt: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>S.No</TableCell>
                        <TableCell>Asset Description</TableCell>
                        <TableCell>Unit of Measure</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>FAIN No & Date</TableCell>
                        <TableCell>Price (Birr)</TableCell>
                        <TableCell>Remark</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.serialNo}</TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.assetDescription}
                              onChange={(e) => handleItemChange(index, 'assetDescription', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.unitOfMeasure}
                              onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                              InputProps={{ inputProps: { min: 1 } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="FAIN No"
                                  value={item.fainNo}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || isNumeric(value)) {
                                      handleItemChange(index, 'fainNo', value);
                                    }
                                  }}
                                  error={!!errors.items?.[index]?.fainNo}
                                  helperText={errors.items?.[index]?.fainNo}
                                  inputProps={{
                                    pattern: '\\d*',
                                    inputMode: 'numeric'
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  type="date"
                                  size="small"
                                  value={item.fainDate}
                                  onChange={(e) => {
                                    const selectedDate = new Date(e.target.value);
                                    const today = getTodayDate();
                                    
                                    if (selectedDate < today) {
                                      alert('Please select a FAIN date from today onwards');
                                      return;
                                    }
                                    
                                    handleItemChange(index, 'fainDate', e.target.value);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                  inputProps={{
                                    min: getFormattedDate(new Date())
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Price (Birr)"
                                  type="number"
                                  value={item.price.birr}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || isPositiveNumber(value)) {
                                      handlePriceChange(index, 'price.birr', value);
                                    }
                                  }}
                                  error={!!errors.items?.[index]?.priceBirr}
                                  helperText={errors.items?.[index]?.priceBirr}
                                  inputProps={{
                                    min: 0,
                                    step: 'any'
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  fullWidth
                                  label="Price (Cents)"
                                  type="number"
                                  value={item.price.cents}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '' || (isPositiveNumber(value) && parseInt(value) <= 99)) {
                                      handlePriceChange(index, 'price.cents', value);
                                    }
                                  }}
                                  error={!!errors.items?.[index]?.priceCents}
                                  helperText={errors.items?.[index]?.priceCents}
                                  inputProps={{
                                    min: 0,
                                    max: 99,
                                    step: 1
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              size="small"
                              value={item.remark}
                              onChange={(e) => handleItemChange(index, 'remark', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveItem(index)}
                              disabled={items.length === 1}
                            >
                              <RemoveIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  sx={{ mt: 2 }}
                >
                  Add Item
                </Button>
              </Grid>

                {/* Signature Section */}
              <Grid container spacing={3} sx={{ mt: 3 }}>
                {/* Asset Transferor */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Asset Transferor</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.assetTransferorName}
                    onChange={(e) => setFormData({ ...formData, assetTransferorName: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={formData.assetTransferorDate}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = getTodayDate();
                      
                      if (selectedDate < today) {
                        alert('Please select a date from today onwards');
                        return;
                      }
                      
                      setFormData({ ...formData, assetTransferorDate: e.target.value });
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: getFormattedDate(new Date())
                    }}
                  />
                </Grid>

                {/* Property Head */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Property DEIT. Head</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.propertyHeadName}
                    onChange={(e) => setFormData({ ...formData, propertyHeadName: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={formData.propertyHeadDate}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const today = getTodayDate();
                      
                      if (selectedDate < today) {
                        alert('Please select a date from today onwards');
                        return;
                      }
                      
                      setFormData({ ...formData, propertyHeadDate: e.target.value });
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: getFormattedDate(new Date())
                    }}
                  />
                </Grid>
              </Grid>

              {/* Witness and Recipient Section */}
              <Grid container spacing={3} sx={{ mt: 3 }}>
                {/* Witness */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Witness</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.witnessName}
                    onChange={(e) => setFormData({ ...formData, witnessName: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Grid>

                {/* Recipient */}
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Recipient</Typography>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Submit Transfer Form
                </Button>
              </Box>
            </Grid>
          </Box>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </DashboardLayout>
  );
};

export default TransferResources;
