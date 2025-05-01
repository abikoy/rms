import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Container,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import {
  Group as StaffIcon,
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Inventory as ResourceIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { fetchUsers } from '../../store/slices/userSlice';
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

const DepartmentHeadDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources = [] } = useSelector(state => state.resources || {});
  const { requests = [] } = useSelector(state => state.requests || {});
  const { users = [] } = useSelector(state => state.users || {});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchResources()),
          dispatch(fetchRequests()),
          dispatch(fetchUsers())
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  // Calculate statistics
  const departmentStaff = users.filter(u => 
    u.department === user?.department && 
    u.role === 'staff'
  ).length;
  
  const departmentResources = resources.filter(r => r.department === user?.department) || [];
  
  const departmentRequests = requests.filter(r => r.department === user?.department) || [];
  const approvedRequests = departmentRequests.filter(r => r.status === 'approved').length;
  const pendingRequests = departmentRequests.filter(r => r.status === 'pending').length;

  const stats = [
    { 
      title: 'Department Staff', 
      value: departmentStaff,
      icon: <StaffIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/staff')
    },
    { 
      title: 'Department Resources', 
      value: departmentResources.length,
      icon: <ResourceIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Approved Requests', 
      value: approvedRequests,
      icon: <ApprovedIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=approved')
    },
    { 
      title: 'Pending Requests', 
      value: pendingRequests,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=pending')
    },
  ];

  // Calculate monthly request statistics
  const currentDate = new Date();
  const monthlyStats = Array(6).fill(0).map((_, index) => {
    const targetDate = new Date();
    targetDate.setMonth(currentDate.getMonth() - (5 - index));
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const monthRequests = departmentRequests.filter(r => 
      new Date(r.createdAt) >= monthStart && 
      new Date(r.createdAt) <= monthEnd
    );

    return {
      month: targetDate.toLocaleString('default', { month: 'short' }),
      approved: monthRequests.filter(r => r.status === 'approved').length,
      pending: monthRequests.filter(r => r.status === 'pending').length,
      rejected: monthRequests.filter(r => r.status === 'rejected').length,
    };
  });

  const requestTrendData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Approved',
        data: monthlyStats.map(stat => stat.approved),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        fill: true,
      },
      {
        label: 'Pending',
        data: monthlyStats.map(stat => stat.pending),
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
      },
      {
        label: 'Rejected',
        data: monthlyStats.map(stat => stat.rejected),
        borderColor: '#F44336',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        fill: true,
      },
    ],
  };

  // Resource status distribution
  const resourceStatusData = {
    labels: ['Available', 'In Use', 'In Maintenance'],
    datasets: [{
      data: [
        departmentResources.filter(r => r.status === 'available').length,
        departmentResources.filter(r => r.status === 'in_use').length,
        departmentResources.filter(r => r.status === 'maintenance').length,
      ],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
    }],
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Department Head Dashboard
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
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Request History (6 Months)
                  </Typography>
                  <Box sx={{ height: '400px', pt: 2 }}>
                    <Line
                      data={requestTrendData}
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
            <Grid item xs={12} md={4}>
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

export default DepartmentHeadDashboard;
