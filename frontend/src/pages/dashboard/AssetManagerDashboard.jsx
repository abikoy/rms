import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Engineering as MaintenanceIcon,
  PlayCircleFilled as InUseIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js';
import DashboardLayout from '../../components/DashboardLayout';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const AssetManagerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources } = useSelector(state => state.resources);

  useEffect(() => {
    dispatch(fetchResources());
  }, [dispatch]);

  // Filter resources by manager type
  const managerResources = resources.filter(r => r.managerType === user?.role);

  // Calculate statistics
  const totalResources = managerResources.length;
  const availableResources = managerResources.filter(r => r.status === 'available').length;
  const inUseResources = managerResources.filter(r => r.status === 'in_use').length;
  const maintenanceResources = managerResources.filter(r => r.status === 'maintenance').length;

  const stats = [
    { 
      title: 'Total Resources', 
      value: totalResources,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Resources In Use', 
      value: inUseResources,
      icon: <InUseIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Resources In Maintenance', 
      value: maintenanceResources,
      icon: <MaintenanceIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Available Resources', 
      value: availableResources,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
  ];

  // Calculate monthly statistics for trend chart
  const currentDate = new Date();
  const monthlyStats = Array(6).fill(0).map((_, index) => {
    const targetDate = new Date();
    targetDate.setMonth(currentDate.getMonth() - (5 - index));
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    return {
      month: targetDate.toLocaleString('default', { month: 'short' }),
      available: managerResources.filter(r => 
        new Date(r.createdAt) >= monthStart && 
        new Date(r.createdAt) <= monthEnd &&
        r.status === 'available'
      ).length,
      inUse: managerResources.filter(r => 
        new Date(r.createdAt) >= monthStart && 
        new Date(r.createdAt) <= monthEnd &&
        r.status === 'in_use'
      ).length,
      maintenance: managerResources.filter(r => 
        new Date(r.createdAt) >= monthStart && 
        new Date(r.createdAt) <= monthEnd &&
        r.status === 'maintenance'
      ).length,
    };
  });

  const resourceTrendData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Available',
        data: monthlyStats.map(stat => stat.available),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
      },
      {
        label: 'In Use',
        data: monthlyStats.map(stat => stat.inUse),
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
      },
      {
        label: 'In Maintenance',
        data: monthlyStats.map(stat => stat.maintenance),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
      },
    ],
  };

  const resourceStatusData = {
    labels: ['Available', 'In Use', 'In Maintenance'],
    datasets: [{
      data: [availableResources, inUseResources, maintenanceResources],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
    }],
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>

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

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resource Status Trend (6 Months)
                  </Typography>
                  <Box sx={{ height: '400px', pt: 2 }}>
                    <Line
                      data={resourceTrendData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            stacked: true,
                          },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Resource Status Distribution
                  </Typography>
                  <Box sx={{ height: '400px', pt: 2 }}>
                    <Doughnut
                      data={resourceStatusData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DashboardLayout>
  );
};

export default AssetManagerDashboard;
