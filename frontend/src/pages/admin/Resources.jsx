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
  Tooltip,
  Dialog,
  DialogContent,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DashboardLayout from '../../components/DashboardLayout';
import { fetchResources, deleteResource } from '../../store/slices/resourceSlice';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

const Resources = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const { resources, isLoading, error } = useSelector((state) => state.resources);
  const userRole = useSelector((state) => state.auth.user?.role);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
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

  const handleAssign = (resource) => {
    navigate(`/resources/${resource._id}/assign`);
  };

  const handleRequestClick = (resource) => {
    setSelectedResource(resource);
    setShowRequestForm(true);
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

  const renderActions = (resource) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
      <Tooltip title="View Details">
        <IconButton
          size="small"
          onClick={() => navigate(`/resources/${resource._id}`)}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {resource.status === 'available' && 
       (userRole === 'ddu_asset_manager' || userRole === 'iot_asset_manager') && (
        <Tooltip title="Assign Resource">
          <IconButton
            size="small"
            color="success"
            onClick={() => handleAssign(resource)}
          >
            <AssignmentIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {resource.managerType === userRole && (
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
  );

  const renderMobileView = () => (
    <Grid container spacing={2}>
      {paginatedResources.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            No resources found
          </Paper>
        </Grid>
      ) : (
        paginatedResources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom>
                  {resource.name}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Serial Number:
                    </Typography>
                    <Typography variant="body1">
                      {resource.serialNumber}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Type:
                      </Typography>
                      <Chip
                        label={resource.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset'}
                        color={resource.type === 'non_fixed_assets' ? 'primary' : 'secondary'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Status:
                      </Typography>
                      <Chip
                        label={resource.status}
                        color={resource.status === 'available' ? 'success' : 
                               resource.status === 'assigned' ? 'warning' : 'error'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Asset Class:
                    </Typography>
                    <Typography variant="body1">
                      {resource.assetClass}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location:
                    </Typography>
                    <Typography variant="body1">
                      {resource.location}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Manager Type:
                    </Typography>
                    <Chip
                      label={resource.managerType === 'ddu_asset_manager' ? 'DDU' : 'IoT'}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1, p: 2 }}>
                {renderActions(resource)}
              </CardActions>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );

  const renderDesktopView = () => (
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
                    label={resource.type === 'non_fixed_assets' ? 'Non-Fixed Asset' : 'Fixed Asset'}
                    color={resource.type === 'non_fixed_assets' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{resource.assetClass}</TableCell>
                <TableCell>{resource.location}</TableCell>
                <TableCell>
                  <Chip
                    label={resource.status}
                    color={resource.status === 'available' ? 'success' : 
                           resource.status === 'assigned' ? 'warning' : 'error'}
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
                  {renderActions(resource)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderFilters = () => (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 3, 
      flexWrap: 'wrap',
      justifyContent: { xs: 'stretch', sm: 'flex-start' }
    }}>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ 
          minWidth: { xs: '100%', sm: '200px' },
          flex: { xs: '1 1 100%', sm: '0 1 auto' }
        }}
      />
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: { xs: '100%', sm: '200px' },
          flex: { xs: '1 1 100%', sm: '0 1 auto' }
        }}
      >
        <InputLabel>Asset Type</InputLabel>
        <Select
          value={assetType}
          label="Asset Type"
          onChange={handleAssetTypeChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="fixed_assets">Fixed Assets</MenuItem>
          <MenuItem value="non_fixed_assets">Non-Fixed Assets</MenuItem>
        </Select>
      </FormControl>
      <FormControl 
        size="small" 
        sx={{ 
          minWidth: { xs: '100%', sm: '200px' },
          flex: { xs: '1 1 100%', sm: '0 1 auto' }
        }}
      >
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={handleStatusChange}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="assigned">Assigned</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
        </Select>
      </FormControl>
    </Box>
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3, 
          flexWrap: 'wrap', 
          gap: 2,
          px: { xs: 2, sm: 0 }
        }}>
          <Typography variant="h5" component="h1">
            Asset Management
          </Typography>
          {(userRole === 'ddu_asset_manager' || userRole === 'iot_asset_manager') && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate(userRole === 'iot_asset_manager' ? '/asset-managers/iot/add' : '/asset-managers/ddu/add')}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              ADD NEW ASSET
            </Button>
          )}
        </Box>

        {renderFilters()}

        <Box sx={{ px: { xs: 2, sm: 0 } }}>
          {(isMobile || isTablet) ? renderMobileView() : renderDesktopView()}
        </Box>

        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            <Typography variant="body2" component="div" sx={{ mr: 2 }}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={handleChangeRowsPerPage}
              size="small"
              sx={{ minWidth: 80 }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <Typography variant="body2" component="div" sx={{ mr: 2 }}>
              {`${page * rowsPerPage + 1}-${Math.min((page + 1) * rowsPerPage, filteredResourcesList.length)} of ${filteredResourcesList.length}`}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                onClick={(e) => handleChangePage(e, page - 1)}
                disabled={page === 0}
                size="small"
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                onClick={(e) => handleChangePage(e, page + 1)}
                disabled={page >= Math.ceil(filteredResourcesList.length / rowsPerPage) - 1}
                size="small"
              >
                <KeyboardArrowRight />
              </IconButton>
            </Box>
          </Box>
        </Box>

      </Box>

      {showRequestForm && (
        <Dialog
          open={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            {selectedResource && (
              <ResourceRequestForm
                resource={selectedResource}
                onClose={() => setShowRequestForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
};

export default Resources;