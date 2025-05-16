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
  TablePagination,
  Chip,
  Container,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Stack
} from '@mui/material';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/axios';

const TransferredResources = () => {
  // All hooks must be at the top level
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    try {
      // Send user role and division info in query params
      const queryParams = new URLSearchParams({
        role: user.role,
        school: user.school || '',
        department: user.department || ''
      }).toString();

      const response = await api.get(`/api/transfers?${queryParams}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.status === 'success') {
        setTransfers(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transfers:', error);
      setError(error.response?.data?.message || 'Failed to fetch transfers');
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const renderMobileCard = (transfer) => (
    <Grid item xs={12} key={transfer._id}>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Transfer No</Typography>
              <Typography>{transfer.transferNo}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography>{new Date(transfer.date).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Asset Transferor</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography>{transfer.assetTransferor?.name || transfer.createdBy?.fullName || 'N/A'}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {transfer.fromDivision}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Recipient</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography>{transfer.recipient?.name || 'N/A'}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {transfer.toDivision}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Resources</Typography>
              <Typography>{transfer.items.map(item => item.assetDescription).join(', ')}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Quantity</Typography>
              <Typography>{transfer.items.reduce((total, item) => total + item.quantity, 0)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={transfer.status}
                color={
                  transfer.status === 'approved' ? 'success' :
                  transfer.status === 'pending' ? 'warning' :
                  transfer.status === 'rejected' ? 'error' : 'default'
                }
                size="small"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grid>
  );

  const renderTable = () => (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: { xs: 'calc(100vh - 300px)', sm: 440 } }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Transfer No</TableCell>
              <TableCell>Date</TableCell>
              {!isTablet && <TableCell>Asset Transferor</TableCell>}
              {!isTablet && <TableCell>Recipient</TableCell>}
              <TableCell>Resource Name</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transfers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transfer) => (
                <TableRow hover key={transfer._id}>
                  <TableCell>{transfer.transferNo}</TableCell>
                  <TableCell>{new Date(transfer.date).toLocaleDateString()}</TableCell>
                  {!isTablet && (
                    <TableCell>
                      {transfer.assetTransferor?.name || transfer.createdBy?.fullName || 'N/A'}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {transfer.fromDivision}
                      </Typography>
                    </TableCell>
                  )}
                  {!isTablet && (
                    <TableCell>
                      {transfer.recipient?.name || 'N/A'}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {transfer.toDivision}
                      </Typography>
                    </TableCell>
                  )}
                  <TableCell>
                    {transfer.items.map(item => item.assetDescription).join(', ')}
                  </TableCell>
                  <TableCell>
                    {transfer.items.reduce((total, item) => total + item.quantity, 0)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transfer.status}
                      color={
                        transfer.status === 'approved' ? 'success' :
                        transfer.status === 'pending' ? 'warning' :
                        transfer.status === 'rejected' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={transfers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" sx={{ mb: 3, color: 'primary.main', fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Transferred Resources
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isMobile ? (
            <Grid container spacing={2}>
              {transfers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(renderMobileCard)}
            </Grid>
          ) : (
            renderTable()
          )}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default TransferredResources;
