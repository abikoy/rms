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
} from '@mui/material';
import { fetchRequests, updateRequestStatus } from '../../store/slices/requestSlice';
import DashboardLayout from '../../components/DashboardLayout';

const PendingRequests = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { requests = [], loading, error } = useSelector((state) => state.requests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (user?.role === 'department_head') {
        try {
          // Fetch requests assigned to this department head
          await dispatch(fetchRequests({
            department: user.department,
            assignedTo: user._id,
            status: 'pending'
          })).unwrap();
        } catch (error) {
          console.error('Error loading requests:', error);
        }
      }
    };
    loadData();
  }, [dispatch, user]);

  // Filter requests for department head's department
  const departmentRequests = requests.filter(request => 
    request.requestedBy?.department === user?.department && 
    request.status === 'pending' &&
    request.assignedTo?.userId === user?._id
  );

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleSubmitAction = async () => {
    try {
      await dispatch(updateRequestStatus({
        id: selectedRequest._id,
        status: actionType,
        comment: comment
      })).unwrap();
      
      setDialogOpen(false);
      setComment('');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Pending Resource Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Requested By</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departmentRequests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request._id}</TableCell>
                  <TableCell>{request.resource.name}</TableCell>
                  <TableCell>{request.requestedBy.name}</TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
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
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleAction(request, 'approved')}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleAction(request, 'rejected')}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {departmentRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No pending requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
