import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  SwapHoriz as TransferIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AssetManagerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [tabValue, setTabValue] = React.useState(0);
  
  const stats = [
    { 
      title: 'Total Resources', 
      value: '324',
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Pending Transfers', 
      value: '8',
      icon: <TransferIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/transfers')
    },
    { 
      title: 'Transfer History', 
      value: '156',
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/history')
    },
    { 
      title: 'Resource Usage', 
      value: '76%',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/analytics')
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome,
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {user?.role === 'ddu_asset_manager' ? 'DDU' : 'IoT'} Resource Management Dashboard
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'grey.50',
                  },
                }}
                onClick={stat.action}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.title}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ width: '100%', mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Resource Statistics" />
              <Tab label="Recent Activities" />
            </Tabs>
          </Box>
          <Box sx={{ mt: 2 }}>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resource Statistics
                      </Typography>
                      <Box sx={{ height: '300px' }}>
                        {/* Add resource statistics chart here */}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
            {tabValue === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Recent Activities
                        </Typography>
                        <Button variant="text" color="primary">
                          View All
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        No recent activities
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Check back later for updates
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AssetManagerDashboard;
