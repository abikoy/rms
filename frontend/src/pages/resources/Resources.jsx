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
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { fetchResources, createResource, updateResource } from '../../store/slices/resourceSlice';

function Resources() {
  const dispatch = useDispatch();
  const { resources, isLoading, error } = useSelector(state => state.resources);
  const { user } = useSelector(state => state.auth);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    location: { building: '', room: '' },
    department: '',
    specifications: {}
  });

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  const handleOpenDialog = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        name: resource.name,
        type: resource.type,
        category: resource.category,
        location: resource.location,
        department: resource.department,
        specifications: resource.specifications || {}
      });
    } else {
      setEditingResource(null);
      setFormData({
        name: '',
        type: '',
        category: '',
        location: { building: '', room: '' },
        department: '',
        specifications: {}
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResource(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingResource) {
      await dispatch(updateResource({ id: editingResource._id, data: formData }));
    } else {
      await dispatch(createResource(formData));
    }
    handleCloseDialog();
    dispatch(fetchResources());
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'category', headerName: 'Category', flex: 1 },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      valueGetter: (params) => 
        `${params.row.location.building} - ${params.row.location.room}`
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'department', headerName: 'Department', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <IconButton
          onClick={() => handleOpenDialog(params.row)}
          disabled={!['system_admin', 'ddu_asset_manager', 'iot_asset_manager'].includes(user.role)}
        >
          <EditIcon />
        </IconButton>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Resources</Typography>
        {['system_admin', 'ddu_asset_manager', 'iot_asset_manager'].includes(user.role) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Resource
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={resources.map(resource => ({ ...resource, id: resource._id }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={isLoading}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingResource ? 'Edit Resource' : 'Add New Resource'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="classroom">Classroom</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="furniture">Furniture</MenuItem>
                <MenuItem value="iot_device">IoT Device</MenuItem>
                <MenuItem value="it_infrastructure">IT Infrastructure</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="engineering">Engineering</MenuItem>
                <MenuItem value="it">IT</MenuItem>
                <MenuItem value="classroom">Classroom</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Building"
              value={formData.location.building}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, building: e.target.value }
              })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Room"
              value={formData.location.room}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, room: e.target.value }
              })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingResource ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Resources;
