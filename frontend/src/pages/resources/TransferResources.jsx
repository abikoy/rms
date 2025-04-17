import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/axios';

const TransferResources = () => {
  const { user } = useSelector((state) => state.auth);
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState('');
  const [transferData, setTransferData] = useState({
    resourceId: '',
    fromDepartment: user?.department || '',
    toDepartment: '',
    quantity: 1,
    reason: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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
      const response = await api.get('/resources/department/' + user.department);
      setResources(response.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch resources',
        severity: 'error'
      });
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/resources/transfer', transferData);
      setSnackbar({
        open: true,
        message: 'Resource transfer initiated successfully',
        severity: 'success'
      });
      // Reset form
      setTransferData({
        resourceId: '',
        fromDepartment: user?.department || '',
        toDepartment: '',
        quantity: 1,
        reason: ''
      });
      fetchResources(); // Refresh resources list
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to transfer resource',
        severity: 'error'
      });
    }
  };

  const handleChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Transfer Resources
        </Typography>

        <Grid container spacing={3}>
          {/* Transfer Form */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Initiate Transfer
                </Typography>
                <Box component="form" onSubmit={handleTransfer} sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Resource</InputLabel>
                        <Select
                          name="resourceId"
                          value={transferData.resourceId}
                          onChange={handleChange}
                          required
                        >
                          {resources.map((resource) => (
                            <MenuItem key={resource._id} value={resource._id}>
                              {resource.name} ({resource.quantity} available)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="From Department"
                        value={transferData.fromDepartment}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth required>
                        <InputLabel>To Department</InputLabel>
                        <Select
                          name="toDepartment"
                          value={transferData.toDepartment}
                          onChange={handleChange}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept} value={dept}>
                              {dept}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Quantity"
                        name="quantity"
                        value={transferData.quantity}
                        onChange={handleChange}
                        required
                        InputProps={{ inputProps: { min: 1 } }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reason for Transfer"
                        name="reason"
                        value={transferData.reason}
                        onChange={handleChange}
                        required
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                      >
                        Submit Transfer Request
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Transfers */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Transfers
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Resource</TableCell>
                        <TableCell>To Department</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* TODO: Add recent transfers data */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
