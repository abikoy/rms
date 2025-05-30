import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
import DepartmentSelect from '../../components/DepartmentSelect';
import { SCHOOLS_LIST, getDepartmentsBySchool } from '../../constants/schools';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Box,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { getPendingUsers, getApprovedUsers, updateUserStatus, deleteUser, updateUserDetails, clearSuccess, clearError } from '../../store/slices/userManagementSlice';

const UserManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSchool, setFilterSchool] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const { pendingUsers, approvedUsers, loading: usersLoading, error } = useSelector((state) => state.userManagement);

  // Fetch users based on active tab
  const fetchUsers = () => {
    const filters = {
      school: filterSchool,
      department: filterDepartment
    };

    if (activeTab === 0) {
      dispatch(getPendingUsers(filters));
    } else {
      dispatch(getApprovedUsers(filters));
    }
  };

  // Effect to fetch users when tab changes or filters change
  useEffect(() => {
    fetchUsers();
  }, [activeTab, filterSchool, filterDepartment]);

  useEffect(() => {
    const filteredUsers = (activeTab === 0 ? pendingUsers : approvedUsers) || [];
    console.log('Current state:', { filteredUsers, usersLoading, error });
  }, [pendingUsers, approvedUsers, usersLoading, error, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
  };

  const handleDepartmentChange = (event) => {
    setFilterDepartment(event.target.value);
    setPage(0);
  };



  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, action: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, user: null });
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: '',
    department: '',
    school: '',
    phoneNumber: ''
  });

  const handleApprove = async (userId) => {
    setConfirmDialog({ open: true, user: userId, action: 'approve' });
  };

  const handleReject = async (userId) => {
    setConfirmDialog({ open: true, user: userId, action: 'reject' });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.user) return;
    try {
      if (confirmDialog.action === 'delete') {
        await dispatch(deleteUser(confirmDialog.user)).unwrap();
        console.log('User deleted successfully');
        // Refresh the lists after deletion
        dispatch(getPendingUsers());
        dispatch(getApprovedUsers());
      } else if (confirmDialog.action === 'approve' || confirmDialog.action === 'reject') {
        await dispatch(updateUserStatus({
          userId: confirmDialog.user,
          status: confirmDialog.action === 'approve' ? 'approved' : 'rejected'
        })).unwrap();
        console.log(`User ${confirmDialog.action}d successfully`);
        // Refresh the lists after status update
        dispatch(getPendingUsers());
        dispatch(getApprovedUsers());
      }
    } catch (error) {
      console.error(`Error ${confirmDialog.action}ing user:`, error);
    } finally {
      setConfirmDialog({ open: false, user: null, action: null });
    }
  };

  const handleCancelAction = () => {
    setConfirmDialog({ open: false, user: null, action: null });
  };

  const handleViewDetails = (user) => {
    setDetailsDialog({ open: true, user });
  };

  const handleCloseDetails = () => {
    setDetailsDialog({ open: false, user: null });
  };

  const handleDelete = (userId) => {
    setConfirmDialog({ open: true, user: userId, action: 'delete' });
  };

  const handleEdit = (user) => {
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || '',
      school: user.school || '',
      phoneNumber: user.phoneNumber || ''
    });
    setEditDialog({ open: true, user });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.user) return;
    try {
      await dispatch(updateUserDetails({
        userId: editDialog.user._id,
        userData: editFormData
      })).unwrap();
      console.log('User updated successfully');
      // Refresh the lists after update
      dispatch(getPendingUsers());
      dispatch(getApprovedUsers());
      setEditDialog({ open: false, user: null });
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const renderUserTable = (users, showActions = false) => {
    const filteredUsers = filterUsers(users);
    const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Box sx={{ width: '100%' }}>
        {/* Mobile and Tablet View (Card Layout) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
          {filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              {usersLoading ? <CircularProgress size={24} /> : 'No users found.'}
            </Box>
          ) : (
            paginatedUsers.map((user) => (
              <Paper
                key={user._id}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{user.email}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                    <Typography variant="body1">{user.fullName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: user.role === 'system_admin' ? 'primary.main' : 'secondary.main',
                        color: '#fff',
                        fontSize: '0.8rem',
                      }}
                    >
                      {user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                    <Typography variant="body1">{user.status}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      {activeTab === 0 ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApprove(user._id)}
                            startIcon={<CheckIcon />}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleReject(user._id)}
                            startIcon={<CloseIcon />}
                          >
                            Reject
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleViewDetails(user)}
                            startIcon={<VisibilityIcon />}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="info"
                            onClick={() => handleEdit(user)}
                            startIcon={<EditIcon />}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(user._id)}
                            startIcon={<DeleteIcon />}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            ))
          )}
        </Box>

        {/* Desktop View (Table Layout) */}
        <TableContainer 
          component={Paper} 
          sx={{
            display: { xs: 'none', md: 'block' },
            maxHeight: 500,
            overflowX: 'auto',
            boxShadow: 2,
            borderRadius: 2,
          }}
        >
          <Table stickyHeader aria-label="user table" size="medium">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>School</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {usersLoading ? <CircularProgress size={24} /> : 'No users found.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow key={user._id} hover>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.school || '-'}</TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          bgcolor: user.role === 'system_admin' ? 'primary.main' : 'secondary.main',
                          color: '#fff',
                          fontSize: { xs: '0.8rem', sm: '1rem' },
                        }}
                      >
                        {user.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>{user.status}</TableCell>
                    <TableCell align="center">
                      {activeTab === 0 && (
                        <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: { xs: 0.5, sm: 1 },
                          flexWrap: { xs: 'wrap', sm: 'nowrap' }
                        }}>
                          <IconButton color="success" size={isMobile ? 'small' : 'medium'} onClick={() => handleApprove(user._id)}>
                            <CheckIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton color="error" size={isMobile ? 'small' : 'medium'} onClick={() => handleReject(user._id)}>
                            <CloseIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton color="primary" size={isMobile ? 'small' : 'medium'} onClick={() => handleViewDetails(user)}>
                            <VisibilityIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                        </Box>
                      )}
                      {activeTab === 1 && (
                        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                          <IconButton color="primary" size={isMobile ? 'small' : 'medium'} onClick={() => handleViewDetails(user)}>
                            <VisibilityIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton color="info" size={isMobile ? 'small' : 'medium'} onClick={() => handleEdit(user)}>
                            <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                          <IconButton color="error" size={isMobile ? 'small' : 'medium'} onClick={() => handleDelete(user._id)}>
                            <DeleteIcon fontSize={isMobile ? 'small' : 'medium'} />
                          </IconButton>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            '.MuiTablePagination-select': {
              minWidth: '16px'
            }
          }}
        />
      </Box>
    );
  };

  if (usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleFilterChange = (event) => {
    setFilterDepartment(event.target.value);
    setPage(0); // Reset to first page when filtering
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterUsers = (users) => {
    let filteredUsers = [...users];
    
    // Apply search filter
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply school filter
    if (filterSchool) {
      filteredUsers = filteredUsers.filter(user =>
        user.school === filterSchool
      );
    }

    // Apply department filter
    if (filterDepartment) {
      filteredUsers = filteredUsers.filter(user =>
        user.department === filterDepartment
      );
    }

    // Apply sorting
    filteredUsers.sort((a, b) => {
      const compareResult = a.fullName.localeCompare(b.fullName);
      return sortOrder === 'ascending' ? compareResult : -compareResult;
    });

    return filteredUsers;
  };

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%', p: { xs: 1, sm: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ mb: 3, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' } }}>User Management</Typography>
        
        <Paper sx={{ width: '100%', overflow: 'hidden', mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons={isMobile ? 'auto' : false}
            aria-label="user tabs"
            sx={{
              '.MuiTabs-flexContainer': { flexDirection: { xs: 'column', sm: 'row' } },
              minHeight: { xs: 40, sm: 48 },
            }}
          >
            <Tab label="Pending Approval" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
            <Tab label="Approved Users" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }} />
          </Tabs>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={isMobile ? 'small' : 'medium'}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>School</InputLabel>
                <Select
                  value={filterSchool}
                  label="School"
                  onChange={(e) => {
                    const school = e.target.value;
                    setFilterSchool(school);
                    // Reset department when school changes or is cleared
                    setFilterDepartment('');
                    // Update available departments based on selected school
                    setAvailableDepartments(school ? getDepartmentsBySchool(school) : []);
                    // Trigger user list refresh
                    fetchUsers();
                  }}
                >
                  <MenuItem value="">All Schools</MenuItem>
                  {SCHOOLS_LIST.map((school) => (
                    <MenuItem key={school} value={school}>{school}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  label="Department"
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  disabled={!filterSchool}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {availableDepartments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                <InputLabel>Sort</InputLabel>
                <Select
                  value={sortOrder}
                  label="Sort"
                  onChange={(e) => setSortOrder(e.target.value)}
                  IconComponent={sortOrder === 'ascending' ? ArrowUpwardIcon : ArrowDownwardIcon}
                >
                  <MenuItem value="ascending">A-Z {<ArrowUpwardIcon sx={{ ml: 1 }} fontSize="small" />}</MenuItem>
                  <MenuItem value="descending">Z-A {<ArrowDownwardIcon sx={{ ml: 1 }} fontSize="small" />}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {usersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {activeTab === 0 && renderUserTable(filterUsers(pendingUsers || []), true)}
              {activeTab === 1 && renderUserTable(filterUsers(approvedUsers || []), false)}
            </Box>
          )}
        </Paper>
      </Box>
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCancelAction}>
        <DialogTitle>{confirmDialog.action === 'approve' ? 'Approve User' : 'Reject User'}</DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmDialog.action} this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelAction}>Cancel</Button>
          <Button onClick={handleConfirmAction} color={confirmDialog.action === 'approve' ? 'success' : 'error'}>
            {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Details Dialog */}
      <Dialog open={detailsDialog.open} onClose={handleCloseDetails} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            m: { xs: 1, sm: 4 },
            width: { xs: '100%', sm: 'auto' },
            borderRadius: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>User Details</DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, minWidth: { xs: 0, sm: 350 } }}>
          {detailsDialog.user && (
            <Box sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Name:</b> {detailsDialog.user.fullName}</Typography>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Email:</b> {detailsDialog.user.email}</Typography>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Role:</b> {detailsDialog.user.role}</Typography>
              <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Status:</b> {detailsDialog.user.status}</Typography>
              {detailsDialog.user.department && (
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Department:</b> {detailsDialog.user.department}</Typography>
              )}
              {detailsDialog.user.phoneNumber && (
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>Phone:</b> {detailsDialog.user.phoneNumber}</Typography>
              )}
              {detailsDialog.user.school && (
                <Typography variant="subtitle1" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}><b>School:</b> {detailsDialog.user.school}</Typography>
              )}
              {/* Add more fields as needed */}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 } }}>
          <Button onClick={handleCloseDetails} sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={editFormData.fullName}
                onChange={handleEditFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={editFormData.phoneNumber}
                onChange={handleEditFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={editFormData.role}
                  onChange={handleEditFormChange}
                  label="Role"
                >
                  <MenuItem value="system_admin">System Admin</MenuItem>
                  <MenuItem value="ddu_asset_manager">DDU Asset Manager</MenuItem>
                  <MenuItem value="iot_asset_manager">IoT Asset Manager</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="technical_team">Technical Team</MenuItem>
                  <MenuItem value="department_head">Department Head</MenuItem>
                  <MenuItem value="school_dean">School Dean</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(['staff', 'department_head', 'school_dean'].includes(editFormData.role)) && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>School</InputLabel>
                  <Select
                    name="school"
                    value={editFormData.school}
                    onChange={handleEditFormChange}
                    label="School"
                  >
                    {SCHOOLS_LIST.map((school) => (
                      <MenuItem key={school} value={school}>{school}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {(['staff', 'department_head'].includes(editFormData.role) && editFormData.school) && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={editFormData.department}
                    onChange={handleEditFormChange}
                    label="Department"
                    disabled={!editFormData.school}
                  >
                    {getDepartmentsBySchool(editFormData.school).map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default UserManagement;
