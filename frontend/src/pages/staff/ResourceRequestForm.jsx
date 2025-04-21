import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Grid,
  Divider,
  IconButton,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const ResourceRequestForm = () => {
  const { user } = useSelector(state => state.auth);
  const [formNumber] = useState(() => String(Math.floor(1000000 + Math.random() * 9000000)));
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);
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
    const newItems = items.filter((_, i) => i !== index);
    // Recalculate item numbers
    const updatedItems = newItems.map((item, i) => ({
      ...item,
      itemNo: i + 1
    }));
    setItems(updatedItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log({
      formNumber,
      date: currentDate,
      items,
      requestedBy: user.name,
    });
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mb: 4 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              DDU Property Division
            </Typography>
            <Typography variant="h6" gutterBottom>
              Non Fixed Asset Requisition Form (N.FARF)
            </Typography>
            <Grid container justifyContent="space-between" sx={{ mt: 2 }}>
              <Grid item>
                <Typography>No: {formNumber}</Typography>
              </Grid>
              <Grid item>
                <Typography>Date: {currentDate}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Requisition Division Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>
              Requisition Division
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              For service that I have Count correctly and to be receive the Non fixed Asset /Property/ enumerated below the use of.
            </Typography>
          </Box>

          {/* Table Section */}
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item No</TableCell>
                  <TableCell>Description Property</TableCell>
                  <TableCell>Unit of Measure</TableCell>
                  <TableCell>Quantity Req.</TableCell>
                  <TableCell>Quantity Issued</TableCell>
                  <TableCell>Birr</TableCell>
                  <TableCell>Cents</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Remarks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.itemNo}</TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.unitOfMeasure}
                        onChange={(e) => handleItemChange(index, 'unitOfMeasure', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantityRequested}
                        onChange={(e) => handleItemChange(index, 'quantityRequested', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantityIssued}
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.birr}
                        onChange={(e) => handleItemChange(index, 'birr', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.cents}
                        onChange={(e) => handleItemChange(index, 'cents', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={item.totalBirr}
                        disabled
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={item.remarks}
                        onChange={(e) => handleItemChange(index, 'remarks', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add Item Button */}
          <Button
            startIcon={<AddIcon />}
            onClick={addItem}
            variant="outlined"
            sx={{ mb: 4 }}
          >
            Add Item
          </Button>

          {/* Signature Section */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                The Requested Division Head
              </Typography>
              <TextField
                fullWidth
                label="Name"
                value={user?.name || ''}
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Signature"
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Date"
                value={currentDate}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Requested and Received by
              </Typography>
              <TextField
                fullWidth
                label="Name"
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Signature"
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Date"
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom>
                Certified by
              </Typography>
              <TextField
                fullWidth
                label="Name"
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Signature"
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Date"
                disabled
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
            >
              Submit Request
            </Button>
          </Box>

          {/* Footer Note */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="caption" color="textSecondary">
              NB: Should be prepared in three Copies
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              1st Original White copy for store
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              2nd Rose for property record and Control
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              3rd Green copy for receiving
            </Typography>
          </Box>
        </Paper>
      </Container>
    </DashboardLayout>
  );
};

export default ResourceRequestForm;
