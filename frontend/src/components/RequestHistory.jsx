import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import axios from 'axios';
import { getAssetManagerSchools } from '../utils/assetManagerUtils';

const RequestHistory = ({ role, title }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const allowedSchools = getAssetManagerSchools(role);
        const response = await axios.get('/api/requests/history', {
          params: {
            schools: allowedSchools,
            status: ['asset_manager_approved', 'asset_manager_rejected']
          }
        });
        setRequests(response.data);
      } catch (err) {
        setError('Failed to fetch request history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [role]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  const getStatusChip = (status) => {
    const color = status === 'asset_manager_approved' ? 'success' : 'error';
    const label = status === 'asset_manager_approved' ? 'Approved' : 'Rejected';
    return <Chip size="small" color={color} label={label} />;
  };

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {requests.map((request) => (
        <Grid item xs={12} key={request._id}>
          <Card>
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
              
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Resource Name</TableCell>
            <TableCell>School</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Requested By</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request._id}>
              <TableCell>{request.resourceName}</TableCell>
              <TableCell>{request.school}</TableCell>
              <TableCell>{request.department}</TableCell>
              <TableCell>{request.requestedBy.name}</TableCell>
              <TableCell>
                {new Date(request.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getStatusChip(request.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Paper sx={{ p: 3 }}>
      <Box mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
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
        <Typography>No request history found.</Typography>
      ) : (
        isMobile ? renderMobileView() : renderDesktopView()
      )}
    </Paper>
  );
};

export default RequestHistory;
