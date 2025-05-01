import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchRequests, createRequest, updateRequestStatus, cancelRequest } from '../../store/slices/requestSlice';
import { fetchResources } from '../../store/slices/resourceSlice';

function Requests() {
  const dispatch = useDispatch();
  const { requests, isLoading, error } = useSelector(state => state.requests);
  const { resources } = useSelector(state => state.resources);
  const { user } = useSelector(state => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    resource: '',
    startTime: '',
    endTime: '',
    purpose: ''
  });
  const [approvalData, setApprovalData] = useState({
    status: '',
    comment: ''
  });

  useEffect(() => {
    dispatch(fetchRequests());
    dispatch(fetchResources());
  }, [dispatch]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      resource: '',
      startTime: '',
      endTime: '',
      purpose: ''
    });
  };

  const handleOpenApprovalDialog = (request) => {
    setSelectedRequest(request);
    setOpenApprovalDialog(true);
  };

  const handleCloseApprovalDialog = () => {
    setOpenApprovalDialog(false);
    setSelectedRequest(null);
    setApprovalData({
      status: '',
      comment: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(createRequest(formData));
    handleCloseDialog();
    dispatch(fetchRequests());
  };

  const handleApproval = async (e) => {
    e.preventDefault();
    await dispatch(updateRequestStatus({
      id: selectedRequest._id,
      ...approvalData
    }));
    handleCloseApprovalDialog();
    dispatch(fetchRequests());
  };

  const handleCancel = async (id) => {
    await dispatch(cancelRequest(id));
    dispatch(fetchRequests());
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      field: 'resource',
      headerName: 'Resource',
      flex: 1,
      valueGetter: (params) => {
        const resource = resources.find(r => r._id === params.row.resource);
        return resource ? resource.name : 'N/A';
      }
    },
    {
      field: 'startTime',
      headerName: 'Start Time',
      flex: 1,
      valueGetter: (params) => new Date(params.row.startTime).toLocaleString()
    },
    {
      field: 'endTime',
      headerName: 'End Time',
      flex: 1,
      valueGetter: (params) => new Date(params.row.endTime).toLocaleString()
    },
    { field: 'purpose', headerName: 'Purpose', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          color={getStatusColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => {
        const canApprove = ['department_head', 'school_dean', 'system_admin'].includes(user.role) &&
          params.row.status === 'pending';
        const canCancel = params.row.requestor === user._id &&
          ['pending', 'approved'].includes(params.row.status);

        return (
          <Box>
            {canApprove && (
              <Button
                size="small"
                onClick={() => handleOpenApprovalDialog(params.row)}
              >
                Review
              </Button>
            )}
            {canCancel && (
              <Button
                size="small"
                color="error"
                onClick={() => handleCancel(params.row._id)}
              >
                Cancel
              </Button>
            )}
          </Box>
        );
      }
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Requests</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          New Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={requests.map(request => ({ ...request, id: request._id }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={isLoading}
        />
      </Paper>

      {/* New Request Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Resource Request</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Resource</InputLabel>
              <Select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                label="Resource"
              >
                {resources.map((resource) => (
                  <MenuItem key={resource._id} value={resource._id}>
                    {resource.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              fullWidth
              label="Purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              margin="normal"
              required
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={openApprovalDialog} onClose={handleCloseApprovalDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Review Request</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Decision</InputLabel>
              <Select
                value={approvalData.status}
                onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                label="Decision"
              >
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Comment"
              value={approvalData.comment}
              onChange={(e) => setApprovalData({ ...approvalData, comment: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApprovalDialog}>Cancel</Button>
          <Button onClick={handleApproval} variant="contained">
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Requests;
