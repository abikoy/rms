import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import DashboardLayout from '../../components/DashboardLayout';
import {
  InventoryOutlined as InventoryIcon,
  SwapHorizOutlined as TransferIcon,
  CheckCircleOutline as AvailableIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const StaffDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources = [], loading } = useSelector(state => state.resources || {});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchResources());
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [dispatch]);

  const myResources = resources.filter(resource => resource.assignedTo === user?._id);
  const availableResources = resources.filter(resource => !resource.assignedTo);
  const pendingTransfers = resources.filter(resource => 
    resource.assignedTo === user?._id && resource.status === 'pending_transfer'
  );

  const resourceChartData = {
    labels: ['My Resources', 'Available', 'Pending Transfer'],
    datasets: [
      {
        data: [myResources.length, availableResources.length, pendingTransfers.length],
        backgroundColor: ['#4caf50', '#2196f3', '#ff9800'],
        borderColor: ['#43a047', '#1e88e5', '#f57c00'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const statsCards = [
    {
      title: 'My Resources',
      value: myResources.length,
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      color: '#4caf50',
    },
    {
      title: 'Available Resources',
      value: availableResources.length,
      icon: <AvailableIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      color: '#2196f3',
    },
    {
      title: 'Pending Transfers',
      value: pendingTransfers.length,
      icon: <TransferIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      color: '#ff9800',
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Staff Dashboard
          </Typography>
          <Typography color="textSecondary">
            Welcome back, {user?.name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Paper
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: 'background.paper',
                  borderTop: 3,
                  borderColor: card.color,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="textSecondary" variant="h6">
                    {card.title}
                  </Typography>
                  {card.icon}
                </Box>
                <Typography variant="h3" component="div">
                  {card.value}
                </Typography>
              </Paper>
            </Grid>
          ))}

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Resource Overview
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut data={resourceChartData} options={chartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activities
              </Typography>
              {/* Add recent activities list here */}
              <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
                No recent activities
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
};

export default StaffDashboard;
