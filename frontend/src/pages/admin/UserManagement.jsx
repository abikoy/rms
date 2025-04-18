import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DashboardLayout from '../../components/DashboardLayout';
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
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getPendingUsers, getApprovedUsers, updateUserStatus } from '../../store/slices/authSlice';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const { pendingUsers, approvedUsers, usersLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log('Fetching users...');
    const fetchUsers = async () => {
      try {
        await Promise.all([
          dispatch(getPendingUsers()),
          dispatch(getApprovedUsers())
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    const filteredUsers = (activeTab === 0 ? pendingUsers : approvedUsers) || [];
    console.log('Current state:', { filteredUsers, usersLoading, error });
  }, [pendingUsers, approvedUsers, usersLoading, error, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleApprove = async (userId) => {
    try {
      await dispatch(updateUserStatus({ userId, status: 'approved' })).unwrap();
      // Refresh both lists
      await Promise.all([
        dispatch(getPendingUsers()),
        dispatch(getApprovedUsers())
      ]);
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(updateUserStatus({ userId, status: 'rejected' })).unwrap();
      // Refresh both lists
      await Promise.all([
        dispatch(getPendingUsers()),
        dispatch(getApprovedUsers())
      ]);
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const renderUserTable = (users, showActions = false) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Department</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department || '-'}</TableCell>
              <TableCell>
                <Box sx={{
                  display: 'inline-block',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {user.role}
                </Box>
              </TableCell>
              <TableCell>
                <IconButton
                  color="primary"
                  title="View"
                  sx={{ mr: 1 }}
                >
                  <VisibilityIcon />
                </IconButton>
                {showActions && (
                  <>
                    <IconButton
                      color="success"
                      onClick={() => handleApprove(user._id)}
                      title="Approve"
                      sx={{ mr: 1 }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleReject(user._id)}
                      title="Reject"
                    >
                      <CloseIcon />
                    </IconButton>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (usersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterDepartment(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const filterUsers = (users) => {
    let filteredUsers = [...users];
    
    // Apply search filter
    if (searchQuery) {
      filteredUsers = filteredUsers.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
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
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>User Management</Typography>
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="PENDING USERS" />
        <Tab label="APPROVED USERS" />
      </Tabs>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by Name or Department"
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ flex: 1 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Department</InputLabel>
          <Select
            value={filterDepartment}
            onChange={handleFilterChange}
            label="Filter by Department"
          >
            <MenuItem value="">All Departments</MenuItem>
            <MenuItem value="cs">Computer Science</MenuItem>
            <MenuItem value="it">Information Technology</MenuItem>
            <MenuItem value="se">Software Engineering</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Sort Order</InputLabel>
          <Select
            value={sortOrder}
            onChange={handleSortChange}
            label="Sort Order"
          >
            <MenuItem value="ascending">Ascending</MenuItem>
            <MenuItem value="descending">Descending</MenuItem>
          </Select>
        </FormControl>
      </Box>

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
    </Box>
    </DashboardLayout>
  );
};


export default UserManagement;
