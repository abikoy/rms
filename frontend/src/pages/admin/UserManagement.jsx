import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';

const UserManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');

  // Mock data - replace with actual API calls
  const users = [
    {
      fullName: 'dira',
      email: 'dira@ddu.edu.et',
      department: 'cs',
      role: 'staff',
      status: 'pending',
    },
    {
      fullName: 'John Doe',
      email: 'john@ddu.edu.et',
      department: 'it',
      role: 'technical_team',
      status: 'approved',
    },
    // Add more mock data as needed
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDepartmentFilter = (event) => {
    setDepartmentFilter(event.target.value);
  };

  const handleSortOrder = (event) => {
    setSortOrder(event.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = departmentFilter ? user.department === departmentFilter : true;
    const matchesStatus = tabValue === 0 ? user.status === 'pending' : user.status === 'approved';
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <DashboardLayout>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          User Management
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="PENDING USERS" />
            <Tab label="APPROVED USERS" />
          </Tabs>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Search by Name or Department"
            variant="outlined"
            size="small"
            sx={{ flexGrow: 1 }}
            value={searchQuery}
            onChange={handleSearch}
          />

          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={handleDepartmentFilter}
              label="Filter by Department"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="cs">Computer Science</MenuItem>
              <MenuItem value="it">Information Technology</MenuItem>
              {/* Add more departments */}
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort Order</InputLabel>
            <Select
              value={sortOrder}
              onChange={handleSortOrder}
              label="Sort Order"
            >
              <MenuItem value="ascending">Ascending</MenuItem>
              <MenuItem value="descending">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Full Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            display: 'inline-block',
                          }}
                        >
                          {user.role}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton color="primary" size="small">
                          <ViewIcon />
                        </IconButton>
                        {user.status === 'pending' && (
                          <>
                            <IconButton color="success" size="small">
                              <ApproveIcon />
                            </IconButton>
                            <IconButton color="error" size="small">
                              <RejectIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default UserManagement;
