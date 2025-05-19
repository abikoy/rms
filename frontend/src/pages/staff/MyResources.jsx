import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Container,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import DashboardLayout from '../../components/DashboardLayout';
import ResourceCard from '../../components/ResourceCard';
import axios from 'axios';

const MyResources = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5003/api/asset-assignments/staff-resources', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === 'success') {
        setResources(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = (resource) => {
    // TODO: Implement return functionality
    console.log('Return resource:', resource);
  };

  const handleTransfer = (resource) => {
    // Navigate to transfer form with resource data including serial numbers
    navigate('/resources/transfer', { 
      state: { 
        resourceId: resource.resource._id, // Use resource.resource._id instead of resource._id
        resourceSerialNumber: resource.resource.serialNumber,
        resourceName: resource.resource.name,
        fromDivision: resource.requestedBy?.department || user?.department,
        quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 1,
        items: [{
          resourceId: resource.resource._id,
          resourceSerialNumber: resource.resource.serialNumber,
          assetDescription: resource.resource.name,
          quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 1
        }]
      } 
    });
  };

  // Group identical resources and combine their quantities
  const groupedResources = resources.reduce((groups, resource) => {
    const serialNumber = resource.resource?.serialNumber;
    if (!serialNumber) return groups;

    if (!groups[serialNumber]) {
      groups[serialNumber] = {
        ...resource,
        items: [...(resource.items || [])],
        assignedAt: resource.assignedAt,
        assignedBy: resource.assignedBy,
        resource: {
          ...resource.resource,
          quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 0
        }
      };
    } else {
      // Combine items and update quantity
      groups[serialNumber].items = [...groups[serialNumber].items, ...(resource.items || [])];
      groups[serialNumber].resource.quantity = groups[serialNumber].items.reduce(
        (total, item) => total + item.quantity, 0
      );
    }
    return groups;
  }, {});

  // Convert grouped resources back to array
  const combinedResources = Object.values(groupedResources);

  // Filter and search functions
  const filteredResources = combinedResources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.resource?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.resource?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || 
      resource.resource?.type === (typeFilter === 'fixed' ? 'fixed_assets' : 'non_fixed_assets');
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const currentPageResources = filteredResources.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="xl">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>My Resources</Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Search and Filter Section */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search resources..."
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
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Filter by Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Filter by Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="fixed">Fixed Assets</MenuItem>
                    <MenuItem value="non-fixed">Non-Fixed Assets</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {/* Resources Grid */}
          <Grid container spacing={3}>
            {currentPageResources.map((resource) => (
              <Grid item xs={12} sm={6} lg={4} key={resource._id}>
                <ResourceCard
                  resource={resource}
                  onReturn={handleReturn}
                  onTransfer={handleTransfer}
                />
              </Grid>
            ))}
          </Grid>

          {/* Empty State */}
          {filteredResources.length === 0 && !error && (
            <Alert severity="info" sx={{ mt: 3 }}>
              No resources found matching your criteria.
            </Alert>
          )}

          {/* Pagination */}
          {filteredResources.length > 0 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default MyResources;
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Typography,
//   Grid,
//   CircularProgress,
//   Alert,
//   TextField,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Pagination,
//   InputAdornment,
//   Container,
//   Paper
// } from '@mui/material';
// import { Search as SearchIcon } from '@mui/icons-material';
// import DashboardLayout from '../../components/DashboardLayout';
// import ResourceCard from '../../components/ResourceCard';
// import axios from 'axios';

// const MyResources = () => {
//   const navigate = useNavigate();
//   const [resources, setResources] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // Search and filter states
//   const [searchQuery, setSearchQuery] = useState('');
//   const [typeFilter, setTypeFilter] = useState('all');
  
//   // Pagination states
//   const [page, setPage] = useState(1);
//   const [itemsPerPage] = useState(6);

//   useEffect(() => {
//     fetchResources();
//   }, []);

//   const fetchResources = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('http://localhost:5003/api/asset-assignments/staff-resources', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.status === 'success') {
//         setResources(response.data.data);
//       }
//     } catch (error) {
//       setError(error.response?.data?.message || 'Failed to fetch resources');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReturn = (resource) => {
//     // TODO: Implement return functionality
//     console.log('Return resource:', resource);
//   };

//   const handleTransfer = (resource) => {
//     // Navigate to transfer form with resource data
//     navigate('/resources/transfer', { 
//       state: { 
//         resourceId: resource._id,
//         resourceName: resource.resource.name,
//         fromDivision: resource.assignedTo?.department,
//         quantity: resource.items?.reduce((total, item) => total + item.quantity, 0) || 0
//       } 
//     });
//   };

//   // Filter and search functions
//   const filteredResources = resources.filter(resource => {
//     const matchesSearch = searchQuery === '' || 
//       resource.resource?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       resource.resource?.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesType = typeFilter === 'all' || 
//       resource.resource?.type === (typeFilter === 'fixed' ? 'fixed_assets' : 'non_fixed_assets');
    
//     return matchesSearch && matchesType;
//   });

//   // Pagination
//   const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
//   const currentPageResources = filteredResources.slice(
//     (page - 1) * itemsPerPage,
//     page * itemsPerPage
//   );

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
//           <CircularProgress />
//         </Box>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <Container maxWidth="xl">
//         <Box sx={{ p: 3 }}>
//           <Typography variant="h4" sx={{ mb: 3 }}>My Resources</Typography>

//           {error && (
//             <Alert severity="error" sx={{ mb: 3 }}>
//               {error}
//             </Alert>
//           )}

//           {/* Search and Filter Section */}
//           <Paper sx={{ p: 2, mb: 3 }}>
//             <Grid container spacing={2} alignItems="center">
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   variant="outlined"
//                   placeholder="Search resources..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <SearchIcon />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth variant="outlined">
//                   <InputLabel>Filter by Type</InputLabel>
//                   <Select
//                     value={typeFilter}
//                     onChange={(e) => setTypeFilter(e.target.value)}
//                     label="Filter by Type"
//                   >
//                     <MenuItem value="all">All Types</MenuItem>
//                     <MenuItem value="fixed">Fixed Assets</MenuItem>
//                     <MenuItem value="non-fixed">Non-Fixed Assets</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//             </Grid>
//           </Paper>

//           {/* Resources Grid */}
//           <Grid container spacing={3}>
//             {currentPageResources.map((resource) => (
//               <Grid item xs={12} sm={6} lg={4} key={resource._id}>
//                 <ResourceCard
//                   resource={resource}
//                   onReturn={handleReturn}
//                   onTransfer={handleTransfer}
//                 />
//               </Grid>
//             ))}
//           </Grid>

//           {/* Empty State */}
//           {filteredResources.length === 0 && !error && (
//             <Alert severity="info" sx={{ mt: 3 }}>
//               No resources found matching your criteria.
//             </Alert>
//           )}

//           {/* Pagination */}
//           {filteredResources.length > 0 && (
//             <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
//               <Pagination
//                 count={totalPages}
//                 page={page}
//                 onChange={(e, value) => setPage(value)}
//                 color="primary"
//                 size="large"
//               />
//             </Box>
//           )}
//         </Box>
//       </Container>
//     </DashboardLayout>
//   );
// };

// export default MyResources;