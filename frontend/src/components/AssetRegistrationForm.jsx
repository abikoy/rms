import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createResource } from '../store/slices/resourceSlice';

const AssetRegistrationForm = ({ assetManagerType }) => {
  console.log('Asset Manager Type:', assetManagerType); // Debug log
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    assetName: '',
    serialNumber: '',
    assetType: '',
    assetClass: '',
    assetModel: '',
    location: '',
    status: 'Not Assigned',
    quantity: '',
    unitPriceBirr: '',
    unitPriceCents: '',
    expenditureRegistryNo: '',
    incomingGoodsRegistryNo: '',
    stockClassification: '',
    storeNo: '',
    shelfNo: '',
    outgoingGoodsRegistryNo: '',
    orderNo: '',
    date: '',
    storeKeeperName: '',
    storeKeeperSignDate: '',
    recipientName: '',
    recipientSignDate: ''
  });



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

    if (name === 'assetType') {
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
        assetClass: ''
      }));
      return;
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

    // Convert excess cents to birr
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
    const totals = calculateTotalPrice();

    // Reset error state
    setError('');

    // Validate required fields
    if (!formData.assetType || !formData.assetClass) {
      const errorMsg = 'Asset type and class are required';
      setError(errorMsg);
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (!assetManagerType) {
      const errorMsg = 'Asset manager type is required';
      setError(errorMsg);
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    // Validate required fields
    const requiredFields = ['assetName', 'serialNumber', 'assetType', 'assetClass', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
      setError(errorMsg);
      setSnackbarMessage(errorMsg);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Log the form data for debugging
      console.log('Form Data:', formData);
      
      // Create the resource data object
      const resourceData = {
        name: formData.assetName,
        serialNumber: formData.serialNumber,
        type: formData.assetType,
        assetClass: formData.assetClass,
        model: formData.assetModel,
        location: formData.location,
        status: 'available',
        quantity: Number(formData.quantity) || 0,
        unitPrice: {
          birr: Number(formData.unitPriceBirr) || 0,
          cents: Number(formData.unitPriceCents) || 0
        },
        totalPrice: {
          birr: totals.birr,
          cents: totals.cents
        },
        expenditureNo: formData.expenditureRegistryNo,
        incomingGoodsNo: formData.incomingGoodsRegistryNo,
        stockClassification: formData.stockClassification,
        storeNo: formData.storeNo,
        shelfNo: formData.shelfNo,
        outgoingGoodsNo: formData.outgoingGoodsRegistryNo,
        orderNo: formData.orderNo,
        managerType: assetManagerType, // Make sure this matches the enum in backend
        date: formData.date || new Date().toISOString(),
        storeKeeper: {
          name: formData.storeKeeperName,
          date: formData.storeKeeperSignDate || new Date().toISOString()
        },
        recipient: {
          name: formData.recipientName,
          date: formData.recipientSignDate || new Date().toISOString()
        }
      };

      // Debug log
      console.log('Submitting resource data:', JSON.stringify(resourceData, null, 2));

      // Log the resource data being sent
      console.log('Sending resource data:', resourceData);

      const result = await dispatch(createResource(resourceData)).unwrap();
      console.log('Resource created successfully:', result);
      // Show success message
      setSnackbarMessage('Asset registered successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Navigate to the resources list page after 2 seconds
      setTimeout(() => {
        navigate('/resources');
      }, 2000);
    } catch (error) {
      console.error('Failed to create asset:', error);
      // Add more detailed error information
      if (error.message) {
        console.error('Error:', error);
      }
      setError(error.message || 'Failed to create asset');
      // Show error message
      setSnackbarMessage(error.message || 'Failed to create asset');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  return (
    <Paper sx={{ p: 4, margin: 'auto', maxWidth: 1200, mt: 4 }}>
      <Button 
        variant="outlined" 
        onClick={() => navigate('/resources')}
        sx={{ mb: 3 }}
      >
        BACK TO LIST
      </Button>

      <Typography variant="h5" component="h2" gutterBottom>
        Add New Asset
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Asset Name"
              name="assetName"
              value={formData.assetName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
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
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                label="Asset Type"
              >
                <MenuItem value="consumable_resources">Consumable Resources</MenuItem>
                <MenuItem value="non_consumable_resources">Non-Consumable Resources</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!formData.assetClass && formData.assetType}>
              <InputLabel>Asset Class</InputLabel>
              <Select
                name="assetClass"
                value={formData.assetClass}
                onChange={handleChange}
                label="Asset Class"
                disabled={!formData.assetType}
              >
                {formData.assetType === 'consumable_resources' && [
                  { value: 'STATIONERY', label: 'Stationery' },
                  { value: 'CLEANING_SUPPLIES', label: 'Cleaning Supplies' },
                  { value: 'FUEL', label: 'Fuel' },
                  { value: 'FOOD_ITEMS', label: 'Food Items' },
                  { value: 'MAINTENANCE_SUPPLIES', label: 'Maintenance Supplies' },
                  { value: 'TEACHING_MATERIALS', label: 'Teaching Materials' },
                  { value: 'MEDICAL_SUPPLIES', label: 'Medications and First-Aid Supplies' }
                ].map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
                {formData.assetType === 'non_consumable_resources' && [
                  { value: 'OFFICE_FURNITURE', label: 'Office Furniture' },
                  { value: 'IT_EQUIPMENT', label: 'Information Technology Equipment' },
                  { value: 'AV_EQUIPMENT', label: 'Audio-Visual Equipment' },
                  { value: 'LAB_EQUIPMENT', label: 'Laboratory Equipment' },
                  { value: 'MACHINERY_TOOLS', label: 'Machinery and Tools' },
                  { value: 'VEHICLES', label: 'Vehicles' },
                  { value: 'BUILDINGS', label: 'University Buildings' }
                ].map(option => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              {!formData.assetClass && formData.assetType && (
                <FormHelperText>Please select an asset class</FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asset Model"
              name="assetModel"
              value={formData.assetModel}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
            />
          </Grid>

          {/* Price Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Price Information
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item Name</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="center">Unit Price (Birr)</TableCell>
                    <TableCell align="center">Unit Price (Cents)</TableCell>
                    <TableCell align="center">Total Price (Birr)</TableCell>
                    <TableCell align="center">Total Price (Cents)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        name="itemName"
                        value={formData.assetName}
                        disabled
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        name="unitPriceBirr"
                        value={formData.unitPriceBirr}
                        onChange={handleChange}
                        inputProps={{ min: 0, style: { textAlign: 'center' } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        name="unitPriceCents"
                        value={formData.unitPriceCents}
                        onChange={handleChange}
                        inputProps={{ min: 0, max: 99, style: { textAlign: 'center' } }}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {calculateTotalPrice().birr}
                    </TableCell>
                    <TableCell align="center">
                      {calculateTotalPrice().cents}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Typography variant="subtitle1">
                Total: {calculateTotalPrice().birr}.{String(calculateTotalPrice().cents).padStart(2, '0')} Birr
              </Typography>
            </Box>
          </Grid>

          {/* Registry Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Registry Information
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Expenditure Registry No."
              name="expenditureRegistryNo"
              value={formData.expenditureRegistryNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Incoming Goods Registry No."
              name="incomingGoodsRegistryNo"
              value={formData.incomingGoodsRegistryNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Stock Classification"
              name="stockClassification"
              value={formData.stockClassification}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Store No."
              name="storeNo"
              value={formData.storeNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Shelf No."
              name="shelfNo"
              value={formData.shelfNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Outgoing Goods Registry No."
              name="outgoingGoodsRegistryNo"
              value={formData.outgoingGoodsRegistryNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Order No."
              name="orderNo"
              value={formData.orderNo}
              onChange={handleChange}
              type="number"
              inputProps={{ min: 0 }}
            />
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

          {/* Signatures */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Signatures
            </Typography>
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

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/resources')}
              >
                CANCEL
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
              >
                SAVE ASSET
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      {/* Success/Error Snackbar */}
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
    </Paper>
  );
};

export default AssetRegistrationForm;
