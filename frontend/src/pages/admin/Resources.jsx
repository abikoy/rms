import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchResources, deleteResource } from '../../store/slices/resourceSlice';

const Resources = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resources, isLoading, error } = useSelector((state) => state.resources);
  const userRole = useSelector((state) => state.auth.user?.role);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [assetType, setAssetType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleAssetTypeChange = (event) => {
    setAssetType(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/resources/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await dispatch(deleteResource(id)).unwrap();
        dispatch(fetchResources());
      } catch (error) {
        console.error('Failed to delete resource:', error);
      }
    }
  };

  const filteredResourcesList = resources
    .filter((resource) =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((resource) => !assetType || resource.type === assetType)
    .filter((resource) => !status || resource.status === status);

  const paginatedResources = filteredResourcesList.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error">{error}</Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Asset Management
          </Typography>
          {(userRole === 'ddu_asset_manager' || userRole === 'iot_asset_manager') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(userRole === 'iot_asset_manager' ? '/asset-managers/iot/add' : '/asset-managers/ddu/add')}
            >
              ADD NEW ASSET
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearch}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Asset Type</InputLabel>
            <Select
              value={assetType}
              label="Asset Type"
              onChange={handleAssetTypeChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="consumable_resources">Consumable resources</MenuItem>
              <MenuItem value="non_consumable_resources">Non-consumable resources</MenuItem>
              
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="in_use">In Use</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Asset Class</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Manager Type</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No resources found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResources.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell>{resource.name}</TableCell>
                    <TableCell>{resource.serialNumber}</TableCell>
                    <TableCell>
                      <Chip
                        label={resource.type === 'consumable_resources' ? 'Consumable' : 'Non-Consumable'}
                        color={resource.type === 'consumable_resources' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{resource.assetClass}</TableCell>
                    <TableCell>{resource.location}</TableCell>
                    <TableCell>
                      <Chip
                        label={resource.status}
                        color={resource.status === 'available' ? 'success' : 
                               resource.status === 'in_use' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={resource.managerType === 'ddu_asset_manager' ? 'DDU' : 'IoT'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/resources/${resource._id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {(userRole === 'admin' || resource.managerType === userRole) && (
                          <>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEdit(resource._id)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(resource._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredResourcesList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>
    </DashboardLayout>
  );
};

export default Resources;
