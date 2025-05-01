import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../../../components/DashboardLayout';
import {
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { getAssetManagerSchools } from '../../../../utils/assetManagerUtils';
import { SCHOOLS } from '../../../../constants/schools';

const PendingRequests = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const user = useSelector((state) => state.auth.user);
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
  };

  const handleCloseDialog = () => {
    setSelectedRequest(null);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('/api/resource-requests', {
          params: {
            status: 'pending',
            role: 'iot_asset_manager'
          }
        });
        setRequests(response.data.data);
      } catch (err) {
        setError('Failed to fetch requests. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`/api/resource-requests/${requestId}/status`, {
        action: 'approve'
      });
      
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      setError('Failed to approve request. Please try again.');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`/api/resource-requests/${requestId}/status`, {
        action: 'reject'
      });
      
      setRequests(requests.filter(req => req._id !== requestId));
    } catch (err) {
      setError('Failed to reject request. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {requests.map((request) => (
        <Grid item xs={12} key={request._id}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Request ID: {request.idResource}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Resource Requested: {request.requestName}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Requested By: {request.requestedBy || 'Unknown'}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Date: {new Date(request.date).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 1, mb: 2 }}>
                <Chip
                  label="Pending"
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 'medium' }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={() => handleViewRequest(request)}
                  sx={{ minWidth: 'auto' }}
                >
                  View
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleApprove(request._id)}
                  sx={{ minWidth: 'auto' }}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleReject(request._id)}
                  sx={{ minWidth: 'auto' }}
                >
                  Reject
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = () => (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <TableContainer component={Paper} sx={{
        minWidth: 800,
        maxHeight: 600,
        boxShadow: 3,
        borderRadius: 2,
        '& .MuiTableCell-root': {
          borderColor: 'divider',
        }
      }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{
              '& th': {
                backgroundColor: 'primary.main',
                color: 'common.white',
                fontWeight: 'bold',
                fontSize: '1rem',
                whiteSpace: 'nowrap',
                py: 2
              }
            }}>
              <TableCell>Request ID</TableCell>
              <TableCell>Resource Requested</TableCell>
              <TableCell>Requested By</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow 
                key={request._id}
                hover
                sx={{
                  '&:nth-of-type(odd)': {
                    backgroundColor: 'action.hover',
                  },
                  '& td': {
                    fontSize: '0.95rem',
                    py: 1.5
                  }
                }}
              >
                <TableCell sx={{ fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                  {request.idResource}
                </TableCell>
                <TableCell sx={{ minWidth: 200 }}>{request.requestName}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {request.requestedBy || 'Unknown'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {new Date(request.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label="Pending"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 'medium' }}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleViewRequest(request)}
                      sx={{ minWidth: 'auto' }}
                    >
                      View
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleApprove(request._id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleReject(request._id)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Reject
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <DashboardLayout>
      <Paper sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            IOT Asset Manager - Pending Requests
          </Typography>
          {error && (
            <Chip
              color="error"
              label={error}
              onDelete={() => setError(null)}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
        {requests.length === 0 ? (
          <Typography>No pending requests found.</Typography>
        ) : (
          isMobile ? renderMobileView() : renderDesktopView()
        )}
      </Paper>
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Request Details - {selectedRequest.idResource}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Resource Requested
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.requestName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Requested By
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedRequest.requestedBy || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date Requested
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {new Date(selectedRequest.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Request Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                      <Typography variant="body1">
                        {selectedRequest.details || 'No additional details provided.'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleApprove(selectedRequest._id);
                  handleCloseDialog();
                }}
              >
                Approve
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  handleReject(selectedRequest._id);
                  handleCloseDialog();
                }}
              >
                Reject
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
};

export default PendingRequests;
