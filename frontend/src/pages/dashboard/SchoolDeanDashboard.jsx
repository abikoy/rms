import React, { useEffect } from 'react';
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
  Domain as DepartmentIcon,
  Pending as PendingIcon,
  Inventory as ResourceIcon,
  SwapHoriz as ResourceUsageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchResources } from '../../store/slices/resourceSlice';
import { fetchRequests } from '../../store/slices/requestSlice';
import { fetchDepartments } from '../../store/slices/departmentSlice';
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

const SchoolDeanDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { resources = [] } = useSelector(state => state.resources || {});
  const { requests = [] } = useSelector(state => state.requests || {});
  const { departments = [] } = useSelector(state => state.departments || {});
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchResources()),
          dispatch(fetchRequests()),
          dispatch(fetchDepartments())
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

  // Filter departments by school
  const schoolDepartments = departments.filter(d => d.school === user?.school) || [];
  
  // Calculate statistics
  const schoolResources = resources.filter(r => r.school === user?.school) || [];
  const takenResources = schoolResources.filter(r => r.status === 'in_use').length;
  const untakenResources = schoolResources.filter(r => r.status === 'available').length;
  const pendingApprovals = requests.filter(r => 
    r.status === 'pending' && 
    r.school === user?.school
  ).length;

  const stats = [
    { 
      title: 'Total Departments', 
      value: schoolDepartments.length,
      icon: <DepartmentIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/departments')
    },
    { 
      title: 'Pending Approvals', 
      value: pendingApprovals,
      icon: <PendingIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/requests?status=pending')
    },
    { 
      title: 'School Resources', 
      value: schoolResources.length,
      icon: <ResourceIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
    { 
      title: 'Resource Usage', 
      value: `${takenResources}/${schoolResources.length}`,
      icon: <ResourceUsageIcon sx={{ fontSize: 40 }} />,
      action: () => navigate('/resources')
    },
  ];

  // Calculate monthly resource usage statistics
  const currentDate = new Date();
  const monthlyStats = Array(6).fill(0).map((_, index) => {
    const targetDate = new Date();
    targetDate.setMonth(currentDate.getMonth() - (5 - index));
    const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    const monthResources = schoolResources.filter(r => 
      new Date(r.createdAt) >= monthStart && 
      new Date(r.createdAt) <= monthEnd
    );

    return {
      month: targetDate.toLocaleString('default', { month: 'short' }),
      taken: monthResources.filter(r => r.status === 'in_use').length,
      available: monthResources.filter(r => r.status === 'available').length,
      maintenance: monthResources.filter(r => r.status === 'maintenance').length,
    };
  });

  const resourceUsageTrendData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'In Use',
        data: monthlyStats.map(stat => stat.taken),
        borderColor: '#FFC107',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        fill: true,
      },
      {
        label: 'Available',
        data: monthlyStats.map(stat => stat.available),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
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

  // Department resource distribution
  const departmentResourceData = {
    labels: schoolDepartments.map(d => d.name || 'Unknown'),
    datasets: [{
      data: schoolDepartments.map(d => 
        resources.filter(r => r.department === d._id).length
      ),
      backgroundColor: [
        '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688',
        '#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800',
      ],
    }],
  };

  return (
    <DashboardLayout>
      <Box sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            School Dean Dashboard
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
                    Resource Usage Trend (6 Months)
                  </Typography>
                  <Box sx={{ height: '400px', pt: 2 }}>
                    <Line
                      data={resourceUsageTrendData}
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
                    Department Resource Distribution
                  </Typography>
                  <Box sx={{ height: '400px', pt: 2 }}>
                    <Doughnut
                      data={departmentResourceData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            display: true,
                          },
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

export default SchoolDeanDashboard;
