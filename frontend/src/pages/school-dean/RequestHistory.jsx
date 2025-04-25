import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);

  const fetchRequests = async () => {
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;

      const response = await axios.get('/api/resource-requests', { params });
      setRequests(response.data.data);

      // Extract unique departments for the filter
      const uniqueDepartments = [...new Set(response.data.data.map(req => req.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      setError('Failed to fetch request history');
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, departmentFilter]);

  const getStatusChip = (status, type = 'status') => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error'
    };
    return <Chip 
      label={`${type === 'status' ? '' : type + ': '}${status}`} 
      color={colors[status] || 'default'} 
      size="small"
    />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Request History</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department Filter</InputLabel>
              <Select
                value={departmentFilter}
                label="Department Filter"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request Number</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell>School Dean</TableCell>
                <TableCell>Final Status</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request.requestNumber}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.requestedBy?.fullName}</TableCell>
                  <TableCell>{request.requestedItems?.length || 0} items</TableCell>
                  <TableCell>{getStatusChip(request.departmentHeadStatus, 'Dept Head')}</TableCell>
                  <TableCell>
                    {request.departmentHeadStatus === 'approved' ? 
                      getStatusChip(request.schoolDeanStatus, 'Dean') : 
                      <Chip label="Awaiting Dept Head" size="small" />
                    }
                  </TableCell>
                  <TableCell>{getStatusChip(request.status)}</TableCell>
                  <TableCell>{formatDate(request.updatedAt || request.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </DashboardLayout>
  );
};

export default RequestHistory;
