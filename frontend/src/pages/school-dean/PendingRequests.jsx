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
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/resource-requests', {
        params: { status: 'pending' }
      });
      setRequests(response.data.data);
    } catch (error) {
      setError('Failed to fetch requests');
      console.error('Error fetching requests:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId, action) => {
    try {
      await axios.patch(`/api/resource-requests/${requestId}/status`, { action });
      setDialogOpen(false);
      setSelectedRequest(null);
      fetchRequests(); // Refresh the list
    } catch (error) {
      setError('Failed to update request status');
      console.error('Error updating request:', error);
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error'
    };
    return <Chip label={status} color={colors[status] || 'default'} />
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Pending Requests</Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request Number</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Department Head Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request.requestNumber}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>{request.requestedBy?.fullName}</TableCell>
                  <TableCell>{request.requestedItems?.length || 0} items</TableCell>
                  <TableCell>{getStatusChip(request.departmentHeadStatus)}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => {
                        setSelectedRequest(request);
                        setDialogOpen(true);
                      }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Review Request</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Request Number:</strong> {selectedRequest.requestNumber}</Typography>
                <Typography><strong>Department:</strong> {selectedRequest.department}</Typography>
                <Typography><strong>Requested By:</strong> {selectedRequest.requestedBy?.fullName}</Typography>
                <Typography sx={{ mt: 2 }}><strong>Requested Items:</strong></Typography>
                {selectedRequest.requestedItems?.map((item, index) => (
                  <Box key={index} sx={{ ml: 2, mt: 1 }}>
                    <Typography>• {item.description} - Quantity: {item.quantityRequested}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleAction(selectedRequest?._id, 'reject')}
              color="error"
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleAction(selectedRequest?._id, 'approve')}
              color="primary"
              variant="contained"
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PendingRequests;
