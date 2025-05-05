import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { useSelector } from 'react-redux';

const AssignedResourcesPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const user = useSelector(state => state.auth.user);
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Details dialog states
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState(null);

  // Get unique departments for filter
  const departments = [...new Set(assignments.map(a => a.department))];

  useEffect(() => {
    // Only fetch if user is a DDU or IOT asset manager
    if (user?.role === 'ddu_asset_manager' || user?.role === 'iot_asset_manager') {
      fetchAssignments();
    } else {
      setError('Only DDU and IOT asset managers can view assignments');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterAssignments();
  }, [searchQuery, departmentFilter, sortOrder, assignments]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        'http://localhost:5003/api/asset-assignments',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setAssignments(response.data.data);
        setFilteredAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError(error.response?.data?.message || 'Failed to fetch assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = [...assignments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment => 
        assignment.resourceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(assignment => 
        assignment.department === departmentFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const nameA = a.resourceName.toLowerCase();
      const nameB = b.resourceName.toLowerCase();
      if (sortOrder === 'asc') {
        return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
      } else {
        return nameB < nameA ? -1 : nameB > nameA ? 1 : 0;
      }
    });

    setFilteredAssignments(filtered);
    setPage(0); // Reset to first page when filtering
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = async (assignment) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5003/api/asset-assignments/${assignment.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.status === 'success') {
        // Transform the response data to match the expected format
        const transformedAssignment = {
          ...assignment,
          resourceName: response.data.data.resource.name,
          serialNumber: response.data.data.resource.serialNumber,
          type: response.data.data.resource.type,
          expirationDate: response.data.data.resource.expirationDate,
          status: response.data.data.status,
          assignedAt: response.data.data.assignedAt,
          requestId: response.data.data.requestId,
          department: response.data.data.requisitionDivision,
          items: response.data.data.items,
          requestedBy: response.data.data.requestedBy.name,
          assignedBy: {
            name: response.data.data.assignedBy.name,
            department: response.data.data.assignedBy.department || 'N/A'
          }
        };
        setSelectedAssignment(transformedAssignment);
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedAssignment(null);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (assignment) => {
    setSelectedForDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5003/api/asset-assignments/${selectedForDelete.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setAssignments(assignments.filter(a => a.id !== selectedForDelete.id));
        setFilteredAssignments(filteredAssignments.filter(a => a.id !== selectedForDelete.id));
        setAlertMessage(`Assignment for ${selectedForDelete.resourceName} has been successfully removed`);
        
        // Auto-hide alert after 5 seconds
        setTimeout(() => setAlertMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError(error.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSelectedForDelete(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          {(user?.role === 'ddu_asset_manager' || user?.role === 'iot_asset_manager') && (
            <Button variant="contained" onClick={fetchAssignments}>
              Retry
            </Button>
          )}
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box p={3}>
        {alertMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              width: '100%',
              position: 'sticky',
              top: 0,
              zIndex: 1000
            }}
            onClose={() => setAlertMessage('')}
          >
            {alertMessage}
          </Alert>
        )}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Assigned Resources
          </Typography>
          <Chip 
            label={user?.role === 'ddu_asset_manager' ? 'DDU Asset Manager' : 'IOT Asset Manager'}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Filters */}
        <Box mb={3} display="flex" gap={2}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" style={{ minWidth: 200 }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={toggleSortOrder}
          >
            Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Button>
        </Box>

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Resource Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Assigned By</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.resourceName}</TableCell>
                    <TableCell>{assignment.serialNumber}</TableCell>
                    <TableCell>{assignment.department}</TableCell>
                    <TableCell>{assignment.requestedBy}</TableCell>
                    <TableCell>{assignment.status}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{assignment.assignedBy.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {assignment.assignedBy.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(assignment)}
                          title="View Details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(assignment)}
                          title="Delete Assignment"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAssignments.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>

        {/* Details Dialog */}
        <Dialog 
          open={detailsOpen} 
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
        >
          {selectedAssignment && (
            <>
              <DialogTitle>
                Assignment Details - {selectedAssignment.assignedBy.role === 'ddu_asset_manager' ? 'DDU' : 'IOT'}
              </DialogTitle>
              <DialogContent dividers>
                <Box display="grid" gap={2}>
                  <Typography variant="h6">Resource Information</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Typography><strong>Name:</strong> {selectedAssignment.resourceName}</Typography>
                    <Typography><strong>Serial Number:</strong> {selectedAssignment.serialNumber}</Typography>
                    <Typography><strong>Type:</strong> {selectedAssignment.type}</Typography>
                    {selectedAssignment.type === 'non_fixed_assets' && (
                      <Box gridColumn="1 / -1">
                        <Typography><strong>Expiration Status:</strong></Typography>
                        <Chip
                          label={
                            !selectedAssignment.expirationDate
                              ? "No expiration date"
                              : new Date(selectedAssignment.expirationDate) <= new Date()
                                ? "Expired"
                                : `Expires in ${Math.ceil((new Date(selectedAssignment.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))} days`
                          }
                          color={
                            !selectedAssignment.expirationDate
                              ? "default"
                              : new Date(selectedAssignment.expirationDate) <= new Date()
                                ? "error"
                                : new Date(selectedAssignment.expirationDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  ? "warning"
                                  : "success"
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Typography variant="h6" mt={2}>Assignment Information</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Typography><strong>Department:</strong> {selectedAssignment.department}</Typography>
                    <Typography><strong>Status:</strong> {selectedAssignment.status}</Typography>
                    <Typography><strong>Request ID:</strong> {selectedAssignment.requestId}</Typography>
                    <Typography><strong>Assignment Date:</strong> {new Date(selectedAssignment.assignedAt).toLocaleDateString()}</Typography>
                  </Box>

                  <Typography variant="h6" mt={2}>People</Typography>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography><strong>Requested By</strong></Typography>
                      <Typography>Name: {selectedAssignment.requestedBy}</Typography>
                      <Typography>Department: {selectedAssignment.department}</Typography>
                    </Box>
                    <Box>
                      <Typography><strong>Assigned By</strong></Typography>
                      <Typography>Name: {selectedAssignment.assignedBy.name}</Typography>
                      <Typography>Department: {selectedAssignment.assignedBy.department}</Typography>
                    </Box>
                  </Box>

                  {selectedAssignment.items && selectedAssignment.items.length > 0 && (
                    <>
                      <Typography variant="h6" mt={2}>Items</Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell>Unit</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell>Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedAssignment.items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.unitOfMeasure}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>${item.unitPrice}</TableCell>
                                <TableCell>${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDetails}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Delete Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this assignment?
              {selectedForDelete && (
                <Box mt={1}>
                  <strong>Resource:</strong> {selectedForDelete.resourceName}<br />
                  <strong>Department:</strong> {selectedForDelete.department}<br />
                  <strong>Request ID:</strong> {selectedForDelete.requestId}
                </Box>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              color="primary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default AssignedResourcesPage;
