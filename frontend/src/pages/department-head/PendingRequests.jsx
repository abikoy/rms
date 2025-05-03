import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResourceById } from '../../store/slices/resourceSlice';
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
  Button,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import { fetchRequests, updateRequestStatus } from '../../store/slices/requestSlice';
import DashboardLayout from '../../components/DashboardLayout';

// Responsive component that switches between table and card view
const ResponsiveRequestList = ({ requests, onAction }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  if (isMobile || isTablet) {
    return (
      <Grid container spacing={2}>
        {requests.map((request) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={request._id}>

            <Card sx={{ 
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'transform 0.2s',
              bgcolor: 'background.paper'
            }}>
              <Box sx={{ 
                bgcolor: 'primary.main', 
                py: 1, 
                px: 2,
                borderTopLeftRadius: 1,
                borderTopRightRadius: 1
              }}>
                <Typography variant="subtitle1" sx={{ color: 'common.white' }}>
                  Request Details
                </Typography>
              </Box>
              <CardContent sx={{ p: 2, flexGrow: 1 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Request ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {request.idResource || request._id}
                      </Typography>
                    </Box>
                    <Chip
                      label={request.status}
                      color={
                        request.status === 'approved'
                          ? 'success'
                          : request.status === 'rejected'
                          ? 'error'
                          : 'warning'
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Resource Requested
                    </Typography>
                    <Box sx={{ 
                      bgcolor: 'grey.50', 
                      p: 1.5, 
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'grey.200',
                      maxHeight: isTablet ? '120px' : 'auto',
                      overflowY: isTablet ? 'auto' : 'visible'
                    }}>
                      <Typography variant="body2">
                        {request.requestName || request.requestedItems?.[0]?.resource?.name || 'Unknown Resource'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Requested By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {request.requestedBy || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(request.date || request.requestDate || request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>


                </Stack>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 2, pt: 0, gap: 1, mt: 'auto' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => onAction(request, 'view')}
                >
                  View
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size={isTablet ? "small" : "medium"}
                  onClick={() => onAction(request, 'approved')}
                  sx={{ 
                    '&:hover': { transform: 'translateY(-1px)' },
                    transition: 'transform 0.2s'
                  }}
                >
                  Approve
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  size={isTablet ? "small" : "medium"}
                  onClick={() => onAction(request, 'rejected')}
                  sx={{ 
                    '&:hover': { transform: 'translateY(-1px)' },
                    transition: 'transform 0.2s'
                  }}
                >
                  Reject
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        boxShadow: 3,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'primary.main' }}>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Request ID</TableCell>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Resource Requested</TableCell>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Requested By</TableCell>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Date</TableCell>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Status</TableCell>
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow 
              key={request._id}
              sx={{ 
                '&:hover': { 
                  bgcolor: 'action.hover',
                  transition: 'background-color 0.2s'
                }
              }}
            >
              <TableCell>{request.idResource || request._id}</TableCell>
              <TableCell>
                {request.requestName || request.requestedItems?.[0]?.resource?.name || 'Unknown Resource'}
              </TableCell>
              <TableCell>
                {request.requestedBy || 'Unknown'}
              </TableCell>
              <TableCell>
                {new Date(request.date || request.requestDate || request.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Chip
                  label={request.status}
                  color={
                    request.status === 'approved'
                      ? 'success'
                      : request.status === 'rejected'
                      ? 'error'
                      : 'warning'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onAction(request, 'view')}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => onAction(request, 'approved')}
                    sx={{ 
                      minWidth: '100px',
                      '&:hover': { transform: 'translateY(-1px)' },
                      transition: 'transform 0.2s'
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => onAction(request, 'rejected')}
                    sx={{ 
                      minWidth: '100px',
                      '&:hover': { transform: 'translateY(-1px)' },
                      transition: 'transform 0.2s'
                    }}
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
  );
};

const PendingRequests = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requests = [], loading, error } = useSelector((state) => state.requests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (user?.role === 'department_head') {
        try {
          await dispatch(fetchRequests({
            status: 'pending',
            department: user.department
          })).unwrap();
        } catch (error) {
          console.error('Error loading requests:', error);
          setErrorMessage('Failed to load requests');
        }
      }
    };
    loadData();
  }, [dispatch, user]);

  const pendingRequests = Array.isArray(requests) ? requests.filter(request => 
    request.status === 'pending'
  ) : [];

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    if (action === 'view') {
      setViewDialogOpen(true);
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const handleSubmitAction = async () => {
    try {
      const result = await dispatch(updateRequestStatus({
        id: selectedRequest._id,
        status: actionType
      })).unwrap();
      
      setSuccessMessage(`Request ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`);
      setConfirmDialogOpen(false);
      setSelectedRequest(null);
      
      dispatch(fetchRequests({
        status: 'pending',
        department: user.department
      }));
    } catch (error) {
      console.error('Error updating request:', error);
      setErrorMessage(error.message || 'Failed to update request status');
    }
  };

  const ConfirmationDialog = () => (
    <Dialog 
      open={confirmDialogOpen} 
      onClose={() => setConfirmDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {actionType === 'approved' ? 'Approve Request' : 'Reject Request'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">
            Are you sure you want to {actionType === 'approved' ? 'approve' : 'reject'} this request?
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleSubmitAction}
          variant="contained"
          color={actionType === 'approved' ? 'success' : 'error'}
        >
          {actionType === 'approved' ? 'Approve' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const ViewDialog = () => {
    const dispatch = useDispatch();
    const { resources } = useSelector((state) => state.resources);

    useEffect(() => {
      if (selectedRequest) {
        // Fetch resources for any requested items that don't have complete price info
        selectedRequest.requestedItems?.forEach(item => {
          if (!item.resource?.price) {
            dispatch(fetchResourceById(item.resource?._id));
          }
        });
      }
    }, [selectedRequest, dispatch]);

    // Calculate total price for each requested item
    const getItemTotalPrice = (item) => {
      const resource = resources.find(r => r._id === item.resource?._id) || item.resource;
      if (!resource?.price) return null;
      
      const quantity = item.quantityRequested || 0;
      const unitPrice = resource.price;
      return {
        birr: (unitPrice.birr || 0) * quantity,
        cents: (unitPrice.cents || 0) * quantity
      };
    };

    return (
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
      <DialogTitle>
        Request Details
      </DialogTitle>
      <DialogContent>
        {selectedRequest && (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Request ID
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRequest.idResource || selectedRequest._id}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Requested By
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedRequest.requestedBy || 'Unknown'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {new Date(selectedRequest.date || selectedRequest.requestDate || selectedRequest.createdAt)
                    .toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Chip
                  label={selectedRequest.status}
                  color={
                    selectedRequest.status === 'approved'
                      ? 'success'
                      : selectedRequest.status === 'rejected'
                      ? 'error'
                      : 'warning'
                  }
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                  Requested Items
                </Typography>
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <TableContainer component={Paper} sx={{ minWidth: 650, maxHeight: 440 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Resource Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Unit of Measure</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Quantity</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Unit Price (ETB)</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Total Amount (ETB)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedRequest.requestedItems?.map((item, index) => {
                          // Fetch resource details if not already loaded
                          React.useEffect(() => {
                            if (item.resource?._id && !resources.find(r => r._id === item.resource._id)) {
                              dispatch(fetchResourceById(item.resource._id));
                            }
                          }, [item.resource?._id]);

                          const resource = resources.find(r => r._id === item.resource?._id) || item.resource;
                          
                          return (
                            <TableRow key={index} hover>
                              <TableCell sx={{ whiteSpace: 'normal', minWidth: 150 }}>
                                {item.description || resource?.name || 'N/A'}
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                {item.unitOfMeasure || resource?.unitOfMeasure || 'N/A'}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                {item.quantityRequested || '0'}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                {item.unitPrice ? 
                                  `${item.unitPrice.birr || 0}.${(item.unitPrice.cents || 0).toString().padStart(2, '0')}` : 
                                  resource?.price ? 
                                  `${resource.price.birr || 0}.${(resource.price.cents || 0).toString().padStart(2, '0')}` :
                                  'Loading...'}
                              </TableCell>
                              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                                {item.totalAmount ? 
                                  `${item.totalAmount.birr || 0}.${(item.totalAmount.cents || 0).toString().padStart(2, '0')}` : 
                                  'Loading...'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
    );
  };

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Pending Resource Requests
          </Typography>
        </Box>

        {(error || errorMessage) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
            {error || errorMessage}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {pendingRequests.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Pending Requests
            </Typography>
            <Typography color="textSecondary">
              There are currently no pending resource requests for your department.
            </Typography>
          </Paper>
        ) : (
          <ResponsiveRequestList requests={pendingRequests} onAction={handleAction} />
        )}

        <ViewDialog />
        <ConfirmationDialog />
      </Container>
    </DashboardLayout>
  );
};

export default PendingRequests;
