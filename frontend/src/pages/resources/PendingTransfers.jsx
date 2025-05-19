import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  Stack,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/axios';

const PendingTransfers = () => {
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const { user } = useSelector((state) => state.auth);

  const fetchPendingTransfers = async () => {
    try {
      const response = await api.get('/api/transfers/pending');
      if (response.data.status === 'success') {
        setPendingTransfers(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch pending transfers',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTransfers();
  }, []);

  const handleTransferAction = async (transferId, action) => {
    try {
      const response = await api.patch(`/api/transfers/${transferId}/action`, {
        action
      });

      if (response.data.status === 'success') {
        setSnackbar({
          open: true,
          message: `Transfer ${action}ed successfully`,
          severity: 'success'
        });
        // Refresh the list
        fetchPendingTransfers();
      }
    } catch (error) {
      console.error(`Error ${action}ing transfer:`, error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || `Failed to ${action} transfer`,
        severity: 'error'
      });
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Pending Transfers
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transfer No</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Resources</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingTransfers.map((transfer) => (
                <TableRow key={transfer._id}>
                  <TableCell>{transfer.transferNo}</TableCell>
                  <TableCell>
                    <Typography>{transfer.createdBy?.fullName}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {transfer.fromDivision}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {transfer.items.map((item, index) => (
                      <Box key={index}>
                        {item.assetDescription}: {item.quantity} {item.unitOfMeasure}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    {new Date(transfer.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.transferStatus}
                      color={
                        transfer.transferStatus === 'accepted' ? 'success' :
                        transfer.transferStatus === 'rejected' ? 'error' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {transfer.transferStatus === 'initiated' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleTransferAction(transfer._id, 'accept')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleTransferAction(transfer._id, 'reject')}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

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

export default PendingTransfers;
