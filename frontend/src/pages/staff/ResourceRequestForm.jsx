import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { API_BASE_URL } from '../../config';

const ResourceRequestForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { user } = useSelector(state => state.auth);
  const [formNumber, setFormNumber] = useState(() => String(Math.floor(1000000 + Math.random() * 9000000)));
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  
  // Initialize items with empty default item
  const [items, setItems] = useState([{
    itemNo: 1,
    description: '',
    unitOfMeasure: '',
    quantityRequested: '',
    quantityIssued: '',
    birr: '',
    cents: '',
    totalBirr: '',
    totalCents: '',
    remarks: ''
  }]);

  // Load selected resource data on component mount
  useEffect(() => {
    const selectedResourceData = localStorage.getItem('selectedResource');
    if (selectedResourceData) {
      try {
        const resource = JSON.parse(selectedResourceData);
        const price = parseFloat(resource.price) || 0;
        const birr = Math.floor(price);
        const cents = Math.round((price - birr) * 100);
        
        setItems([{
          itemNo: 1,
          description: resource.description || '',
          unitOfMeasure: resource.unitOfMeasure || '',
          quantityRequested: '',
          quantityIssued: '',
          birr: birr.toString(),
          cents: cents.toString(),
          totalBirr: '',
          totalCents: '',
          remarks: ''
        }]);

        localStorage.removeItem('selectedResource');
      } catch (error) {
        console.error('Error loading resource data:', error);
      }
    }
  }, []);

  const validateNumericInput = (value, field) => {
    if (value === '') return true; // Allow empty values
    const numericRegex = /^\d*$/;
    if (!numericRegex.test(value)) {
      setError(`${field} must contain only numeric characters`);
      return false;
    }
    
    // Check for negative values in specific fields
    if (['Quantity Requested', 'Birr', 'Cents'].includes(field)) {
      const numValue = parseInt(value, 10);
      if (numValue < 0) {
        setError(`${field} cannot be negative`);
        return false;
      }
      
      // Additional validation for cents
      if (field === 'Cents' && numValue > 99) {
        setError('Cents must be between 0 and 99');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const adjustCurrency = (item) => {
    let birr = parseInt(item.birr, 10) || 0;
    let cents = parseInt(item.cents, 10) || 0;
    
    // If cents exceed 99, convert excess to birr
    if (cents > 99) {
      const additionalBirr = Math.floor(cents / 100);
      birr += additionalBirr;
      cents = cents % 100;
    }
    
    return {
      birr: birr.toString(),
      cents: cents.toString()
    };
  };

  const calculateTotal = (item) => {
    const quantity = parseInt(item.quantityRequested, 10) || 0;
    const birr = parseInt(item.birr, 10) || 0;
    const cents = parseInt(item.cents, 10) || 0;
    
    // Convert everything to cents for accurate calculation
    const totalCents = quantity * (birr * 100 + cents);
    
    // Convert back to birr and cents
    const totalBirr = Math.floor(totalCents / 100);
    const remainingCents = totalCents % 100;
    
    return {
      totalBirr: totalBirr.toString(),
      totalCents: remainingCents.toString().padStart(2, '0')
    };
  };

  const handleItemChange = (index, field, value) => {
    // Validate numeric fields
    if (['itemNo', 'quantityRequested', 'quantityIssued', 'birr', 'cents'].includes(field)) {
      if (!validateNumericInput(value, field === 'quantityRequested' ? 'Quantity Requested' : 
                                     field === 'birr' ? 'Birr' : 
                                     field === 'cents' ? 'Cents' : field)) {
        return;
      }
    }

    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Adjust currency if cents field is changed
    if (field === 'cents') {
      const { birr, cents } = adjustCurrency(newItems[index]);
      newItems[index].birr = birr;
      newItems[index].cents = cents;
    }

    // Recalculate total if quantity or price changes
    if (['quantityRequested', 'birr', 'cents'].includes(field)) {
      const { totalBirr, totalCents } = calculateTotal(newItems[index]);
      newItems[index].totalBirr = totalBirr;
      newItems[index].totalCents = totalCents;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      itemNo: items.length + 1,
      description: '',
      unitOfMeasure: '',
      quantityRequested: '',
      quantityIssued: '',
      birr: '',
      cents: '',
      totalBirr: '',
      totalCents: '',
      remarks: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      newItems.forEach((item, i) => {
        item.itemNo = i + 1;
      });
      setItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        items: items.map(item => ({
          itemNo: item.itemNo,
          description: item.description,
          unitOfMeasure: item.unitOfMeasure,
          quantityRequested: parseInt(item.quantityRequested) || 0,
          price: {
            birr: parseInt(item.birr) || 0,
            cents: parseInt(item.cents) || 0
          },
          totalAmount: {
            birr: parseInt(item.totalBirr) || 0,
            cents: parseInt(item.totalCents) || 0
          }
        }))
      };

      const response = await fetch(`${API_BASE_URL}/api/resource-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit request');
      }

      // Show success message and redirect
      alert('Request submitted successfully');
      navigate('/staff/my-requests');

    } catch (error) {
      setError(error.message);
    }
  };

  const renderItemCard = (item, index) => (
    <Card key={index} sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Item No. {item.itemNo}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Description"
              value={item.description}
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unit of Measure"
              value={item.unitOfMeasure}
              onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity Requested"
              type="text"
              value={item.quantityRequested}
              onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
              variant="outlined"
              size="small"
              error={error.includes('Quantity')}
              helperText={error.includes('Quantity') ? error : ''}
              inputProps={{ min: "0" }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity Issued"
              type="text"
              value={item.quantityIssued}
              onChange={(e) => handleItemChange(index, 'quantityIssued', e.target.value)}
              variant="outlined"
              size="small"
              disabled
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Price (Birr)"
                type="text"
                value={item.birr}
                onChange={(e) => handleItemChange(index, 'birr', e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
                error={error.includes('Birr')}
                helperText={error.includes('Birr') ? error : ''}
                inputProps={{ min: "0" }}
              />
              <TextField
                label="Cents"
                type="text"
                value={item.cents}
                onChange={(e) => handleItemChange(index, 'cents', e.target.value)}
                variant="outlined"
                size="small"
                sx={{ width: '100px' }}
                error={error.includes('Cents')}
                helperText={error.includes('Cents') ? error : ''}
                inputProps={{ min: "0", max: "99" }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                label="Total (Birr)"
                type="text"
                value={item.totalBirr}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Total Cents"
                type="text"
                value={item.totalCents}
                variant="outlined"
                size="small"
                sx={{ width: '100px' }}
                InputProps={{ readOnly: true }}
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              value={item.remarks}
              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
        </Grid>

        {items.length > 1 && (
          <IconButton
            onClick={() => removeItem(index)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Resource Request Form
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Form Number"
                value={formNumber}
                onChange={(e) => {
                  if (validateNumericInput(e.target.value, 'Form Number')) {
                    setFormNumber(e.target.value);
                  }
                }}
                variant="outlined"
                size="small"
                error={error.includes('Form Number')}
                helperText={error.includes('Form Number') ? error : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                value={currentDate}
                disabled
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 3 }}>
            {items.map((item, index) => renderItemCard(item, index))}
          </Box>

          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            variant="outlined"
            sx={{ mb: 3 }}
          >
            Add Item
          </Button>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Requested By
              </Typography>
              <TextField
                fullWidth
                label="Name"
                value={user?.fullName || ''}
                disabled
                sx={{ mb: 2 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Department"
                value={user?.department || ''}
                disabled
                sx={{ mb: 2 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Date"
                value={currentDate}
                disabled
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              size={isMobile ? 'small' : 'medium'}
            >
              Submit Request
            </Button>
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default ResourceRequestForm;