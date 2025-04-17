import React, { useState } from 'react';
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
import { useSelector } from 'react-redux';
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
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('ascending');

  // Mock data - replace with actual API calls
  const pendingUsers = [
    {
      fullName: 'dira',
      email: 'dira@ddu.edu.et',
      department: 'cs',
      role: 'staff',
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

  // Sample data for the line chart
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Resource Usage 2024',
        data: [18, 15, 4, 8, 2, 13, 13, 15, 16, 19, 17, 19],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
      },
      {
        label: 'Resource Usage 2023',
        data: [12, 10, 3, 6, 5, 8, 9, 10, 11, 12, 11, 13],
        borderColor: 'rgb(99, 102, 241, 0.3)',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        fill: true,
      },
    ],
  };

  // Sample data for the traffic source chart
  const trafficData = {
    labels: ['Desktop', 'Tablet', 'Phone'],
    datasets: [
      {
        data: [63, 15, 22],
        backgroundColor: ['rgb(99, 102, 241)', 'rgb(16, 185, 129)', 'rgb(249, 115, 22)'],
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
              title="BUDGET"
              value="$24k"
              icon={<Assessment sx={{ color: 'primary.main' }} />}
              trend={{ type: 'increase', value: 12 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL USERS"
              value="1.6k"
              icon={<People sx={{ color: 'primary.main' }} />}
              trend={{ type: 'decrease', value: 16 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TASK PROGRESS"
              value="75.5%"
              icon={<Speed sx={{ color: 'primary.main' }} />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL PROFIT"
              value="$15k"
              icon={<Assessment sx={{ color: 'primary.main' }} />}
              trend={{ type: 'increase', value: 8 }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Resource Usage</Typography>
                  <IconButton size="small">↻</IconButton>
                </Box>
                <Box sx={{ height: 350 }}>
                  <Line
                    data={salesData}
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
                  Traffic Source
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={trafficData}
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
