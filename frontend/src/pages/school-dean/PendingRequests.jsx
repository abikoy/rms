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
  Grid,
  TextField
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [comment, setComment] = useState('');

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
      await axios.patch(`/api/resource-requests/${requestId}/status`, { action, comment });
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
                <TableCell>Request ID</TableCell>
                <TableCell>Resource Requested</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Department Head Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request.idResource || request._id}</TableCell>
                  <TableCell>
                    {request.requestName || request.requestedItems?.[0]?.resource?.name || 'Unknown Resource'}
                  </TableCell>
                  <TableCell>
                    {request.requestedBy || 'Unknown'}
                  </TableCell>
                  <TableCell>{request.requestedItems?.length || 0} items</TableCell>
                  <TableCell>{getStatusChip(request.departmentHeadStatus)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogOpen(true);
                          setActionType('view');
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setDialogOpen(true);
                          setActionType('approve');
                        }}
                      >
                        Review
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog 
          open={dialogOpen} 
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {actionType === 'view' ? 'Request Details' : 
             actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
          </DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Request ID
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.idResource || selectedRequest._id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Requested By
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.requestedBy || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedRequest.date || selectedRequest.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={selectedRequest.status}
                      color={
                        selectedRequest.status === 'approved' ? 'success' :
                        selectedRequest.status === 'rejected' ? 'error' : 'warning'
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Requested Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Resource Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Unit of Measure</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Unit Price</TableCell>
                            <TableCell align="right">Total Amount</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedRequest.requestedItems?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.resource?.name || 'Unknown'}</TableCell>
                              <TableCell>{item.description || 'N/A'}</TableCell>
                              <TableCell>{item.unitOfMeasure || 'N/A'}</TableCell>
                              <TableCell align="right">{item.quantityRequested}</TableCell>
                              <TableCell align="right">
                                {item.unitPrice ? `${item.unitPrice.birr}.${item.unitPrice.cents || '00'} Birr` : 'N/A'}
                              </TableCell>
                              <TableCell align="right">
                                {item.totalAmount ? `${item.totalAmount.birr}.${item.totalAmount.cents || '00'} Birr` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>

                {actionType !== 'view' && (
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Comment"
                    fullWidth
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    sx={{ mt: 3 }}
                  />
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>
              {actionType === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {actionType !== 'view' && (
              <>
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
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PendingRequests;
