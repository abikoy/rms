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
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import { API_BASE_URL } from '../../config';

const ResourceRequestForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useSelector(state => state.auth);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const [items, setItems] = useState([{
    itemNo: 1,
    resource: '',
    description: '',
    unitOfMeasure: '',
    quantityRequested: '1',
    birr: '0',
    cents: '0',
    totalBirr: '',
    totalCents: '',
    remarks: ''
  }]);

  useEffect(() => {
    const selectedResourceData = localStorage.getItem('selectedResource');
    if (selectedResourceData) {
      try {
        const resource = JSON.parse(selectedResourceData);
        console.log('Received resource data:', resource); // Debug log

        // Extract price information
        const birr = resource.price?.birr || 0;
        const cents = resource.price?.cents || 0;

        // Set initial item data
        const initialItem = {
          itemNo: 1,
          resource: resource.resourceId,
          description: resource.description || '',
          unitOfMeasure: resource.unitOfMeasure || '',
          quantityRequested: '1',
          birr: birr.toString(),
          cents: cents.toString(),
          totalBirr: birr.toString(),
          totalCents: cents.toString(),
          remarks: ''
        };

        console.log('Setting item data:', initialItem); // Debug log
        setItems([initialItem]);

        // Clean up
        localStorage.removeItem('selectedResource');
      } catch (error) {
        console.error('Error loading resource data:', error);
        setError('Error loading resource data. Please try again.');
      }
    }
  }, []);

  const calculateTotal = (item) => {
    const quantity = parseInt(item.quantityRequested, 10) || 0;
    const birr = parseInt(item.birr, 10) || 0;
    const cents = parseInt(item.cents, 10) || 0;
    const totalCents = quantity * (birr * 100 + cents);
    const totalBirr = Math.floor(totalCents / 100);
    const remainingCents = totalCents % 100;

    return {
      totalBirr: totalBirr.toString(),
      totalCents: remainingCents.toString().padStart(2, '0')
    };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    if (['quantityRequested', 'birr', 'cents'].includes(field)) {
      const { totalBirr, totalCents } = calculateTotal(newItems[index]);
      newItems[index].totalBirr = totalBirr;
      newItems[index].totalCents = totalCents;
    }

    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('Current user data:', user);
      
      if (!user || !user.department) {
        console.log('Missing department data:', user);
        setError('Department information is missing');
        return;
      }

      // Determine school based on department
      let userSchool;
      if (user.department.toLowerCase().includes('computer') || 
          user.department.toLowerCase().includes('software') || 
          user.department.toLowerCase().includes('it')) {
        userSchool = 'School of Computing';
      } else if (user.department.toLowerCase().includes('business') || 
                 user.department.toLowerCase().includes('economics') || 
                 user.department.toLowerCase().includes('accounting')) {
        userSchool = 'School of Business and Economics';
      } else if (user.department.toLowerCase().includes('health') || 
                 user.department.toLowerCase().includes('nursing') || 
                 user.department.toLowerCase().includes('medicine')) {
        userSchool = 'School of Health Science';
      }

      if (!userSchool) {
        console.log('Could not determine school from department:', user.department);
        setError('Could not determine school from department');
        return;
      }

      if (items.some(item => !item.resource || !item.quantityRequested)) {
        setError('Please fill in all required fields for each item');
        return;
      }

      const requestData = {
        items: items.map(item => ({
          itemNo: item.itemNo,
          resource: item.resource,
          description: item.description.trim(),
          unitOfMeasure: item.unitOfMeasure.trim(),
          quantityRequested: parseInt(item.quantityRequested) || 1,
          price: {
            birr: parseInt(item.birr) || 0,
            cents: parseInt(item.cents) || 0
          },
          totalAmount: {
            birr: parseInt(item.totalBirr) || 0,
            cents: parseInt(item.totalCents) || 0
          },
          remarks: item.remarks?.trim() || ''
        })),
        department: user.department,
        school: userSchool,  // Send the determined school
        requestedBy: user.id,
        role: 'staff'
      };

      // Log the request data for debugging
      console.log('Sending request data:', requestData);

      const response = await fetch(`${API_BASE_URL}/api/resource-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit request');
      }

      const result = await response.json();
      setSuccessMessage('Resource request submitted successfully');
      setItems([{ itemNo: 1 }]);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.message || 'Failed to submit request');
    }
  };

  const renderItemCard = (item, index) => (
    <Card key={index} sx={{ mb: 2 }}>
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
              variant="outlined"
              size="small"
              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unit of Measure"
              value={item.unitOfMeasure}
              variant="outlined"
              size="small"
              onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Quantity Requested"
              value={item.quantityRequested}
              onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
              variant="outlined"
              size="small"
              type="number"
              inputProps={{ min: "1" }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Price (Birr)"
              value={item.birr}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Price (Cents)"
              value={item.cents}
              variant="outlined"
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Total (Birr)"
              value={item.totalBirr}
              variant="outlined"
              size="small"
              InputProps={{
                readOnly: true,
                startAdornment: <InputAdornment position="start">ETB</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Total (Cents)"
              value={item.totalCents}
              variant="outlined"
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remarks"
              value={item.remarks}
              onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => {
          setSuccessMessage('');
          navigate('/staff/available-resources');
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom>
            Staff Resource Request Form
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
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={items.length === 0}
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
