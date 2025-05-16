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
  const [items, setItems] = useState([{
    serialNo: 1,
    assetDescription: location.state?.resourceName || '',
    unitOfMeasure: '',
    quantity: location.state?.quantity || 1,
    fainNo: '',
    fainDate: new Date().toISOString().split('T')[0],
    price: {
      birr: 0,
      cents: 0
    },
    remark: ''
  }]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transferData = {
        ...formData,
        resourceId: location.state?.resourceId,
        items: items.map(item => ({
          ...item,
          fainDate: item.fainDate ? new Date(item.fainDate).toISOString() : null
        }))
      };
      
      const token = localStorage.getItem('token');
      await api.post('/api/transfers', transferData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({
        open: true,
        message: 'Transfer form submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit transfer form',
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
                  name="transferNo"
                  value={formData.transferNo}
                  onChange={(e) => setFormData({ ...formData, transferNo: e.target.value })}
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
                                  type="text"
                                  size="small"
                                  value={item.fainNo}
                                  onChange={(e) => handleItemChange(index, 'fainNo', e.target.value)}
                                  placeholder="FAIN No."
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
                                  type="number"
                                  size="small"
                                  value={item.price.birr}
                                  onChange={(e) => handleItemChange(index, 'price', { ...item.price, birr: parseInt(e.target.value) })}
                                  placeholder="Birr"
                                />
                              </Grid>
                              <Grid item xs={6}>
                                <TextField
                                  type="number"
                                  size="small"
                                  value={item.price.cents}
                                  onChange={(e) => handleItemChange(index, 'price', { ...item.price, cents: parseInt(e.target.value) })}
                                  placeholder="Cents"
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
