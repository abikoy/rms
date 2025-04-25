import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  TextField,
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
                        {request._id}
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
                      Resources
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
                      {request.requestedItems?.map((item, index) => (
                        <Typography 
                          key={index} 
                          variant="body2" 
                          sx={{ 
                            '&:not(:last-child)': { 
                              mb: 1,
                              pb: 1,
                              borderBottom: '1px solid',
                              borderColor: 'grey.200'
                            }
                          }}
                        >
                          {item.description}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Requested By
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {request.requestedBy?.fullName || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Date
                    </Typography>
                    <Typography variant="body2">
                      {new Date(request.requestDate || request.createdAt).toLocaleDateString('en-US', {
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
            <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Resource</TableCell>
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
              <TableCell>{request._id}</TableCell>
              <TableCell>
                {request.requestedItems?.map((item, index) => (
                  <div key={index}>{item.description}</div>
                ))}
              </TableCell>
              <TableCell>
                {request.requestedBy?.fullName || 'Unknown'}
              </TableCell>
              <TableCell>
                {new Date(request.requestDate || request.createdAt).toLocaleDateString()}
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
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (user?.role === 'department_head') {
        try {
          // Fetch pending requests for this department
          await dispatch(fetchRequests({
            status: 'pending',
            department: user.department // Add department filter
          })).unwrap();
        } catch (error) {
          console.error('Error loading requests:', error);
        }
      }
    };
    loadData();
  }, [dispatch, user]);

  // Filter requests for department head's department
  const pendingRequests = Array.isArray(requests) ? requests.filter(request => 
    request.status === 'pending'
  ) : [];

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      const result = await dispatch(updateRequestStatus({
        id: selectedRequest._id,
        status: actionType,
        comment: comment
      })).unwrap();
      
      // Show success message
      setSuccessMessage(`Request ${actionType === 'approved' ? 'approved' : 'rejected'} successfully`);
      
      // Reset form
      setDialogOpen(false);
      setComment('');
      setSelectedRequest(null);
      
      // Refresh the requests list
      dispatch(fetchRequests({
        status: 'pending',
        department: user.department
      }));
    } catch (error) {
      console.error('Error updating request:', error);
      setErrorMessage(error.message || 'Failed to update request status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Pending Resource Requests
          </Typography>
         
        </Box>

        {(error || errorMessage) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || errorMessage}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
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

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {actionType === 'approved' ? 'Approve Request' : 'Reject Request'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Comment"
              fullWidth
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitAction}
              color={actionType === 'approved' ? 'primary' : 'error'}
            >
              {actionType === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  );
};

export default PendingRequests;
