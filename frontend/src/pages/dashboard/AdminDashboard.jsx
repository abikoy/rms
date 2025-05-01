import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Assessment,
  Speed,
} from '@mui/icons-material';
import {
  CheckCircle as ApproveIcon,
  Close as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import DashboardLayout from '../../components/DashboardLayout';
import { Line } from 'react-chartjs-2';
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
import { Doughnut } from 'react-chartjs-2';

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

const StatCard = ({ title, value, icon, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: 'primary.light',
            borderRadius: '50%',
            width: 48,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      {trend && (
        <Typography
          variant="body2"
          sx={{
            color: trend.type === 'increase' ? 'success.main' : 'error.main',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <TrendingUp
            sx={{
              fontSize: 16,
              mr: 0.5,
              transform: trend.type === 'decrease' ? 'rotate(180deg)' : 'none',
            }}
          />
          {trend.value}% Since last month
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { resources } = useSelector((state) => state.resources);
  const { users } = useSelector((state) => state.users);
  const approvedUsers = users.filter(user => user.status === 'approved');

  useEffect(() => {
    dispatch(fetchResources());
    dispatch(fetchUsers());
  }, [dispatch]);

  // Calculate statistics
  const totalResources = resources.length;
  const totalUsers = approvedUsers.length;
  const dduAssets = resources.filter(r => r.managerType === 'ddu_asset_manager').length;
  const iotAssets = resources.filter(r => r.managerType === 'iot_asset_manager').length;

  // Calculate asset class distribution
  const assetClassCounts = resources.reduce((acc, resource) => {
    acc[resource.assetClass] = (acc[resource.assetClass] || 0) + 1;
    return acc;
  }, {});

  // Prepare data for the asset class chart
  const assetClassData = {
    labels: Object.keys(assetClassCounts),
    datasets: [
      {
        data: Object.values(assetClassCounts),
        backgroundColor: [
          'rgb(99, 102, 241)',   // Indigo
          'rgb(16, 185, 129)',   // Green
          'rgb(249, 115, 22)',   // Orange
          'rgb(236, 72, 153)',   // Pink
          'rgb(59, 130, 246)',   // Blue
          'rgb(168, 85, 247)',   // Purple
        ],
      },
    ],
  };

  // Prepare data for the resource trend chart
  const resourceTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'DDU Assets',
        data: [10, 12, 15, 14, 16, 17, 18, 19, 20, 22, 23, dduAssets],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
      {
        label: 'IoT Assets',
        data: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, iotAssets],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <DashboardLayout>
      <Box sx={{ py: 2 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard Overview
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL RESOURCES"
              value={totalResources}
              icon={<Assessment sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL USERS"
              value={totalUsers}
              icon={<People sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="DDU ASSETS"
              value={dduAssets}
              icon={<Speed sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="IOT ASSETS"
              value={iotAssets}
              icon={<Assessment sx={{ color: 'primary.main' }} />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Resource Registration Trend</Typography>
                  <IconButton size="small">↻</IconButton>
                </Box>
                <Box sx={{ height: 350 }}>
                  <Line
                    data={resourceTrendData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Asset Class Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={assetClassData}
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

        

        
      </Box>
    </DashboardLayout>


  );
};

export default AdminDashboard;
