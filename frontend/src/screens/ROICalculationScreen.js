import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import config from '../config';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ROICalculationScreen = () => {
  // State for data
  const [requirements, setRequirements] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [squads, setSquads] = useState([]);
  
  // State for filters
  const [bucketFilter, setBucketFilter] = useState('all');
  const [squadFilter, setSquadFilter] = useState('all');
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, bucketsRes, squadsRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/requirements`),
          axios.get(`${config.API_BASE_URL}/requirements/buckets`),
          axios.get(`${config.API_BASE_URL}/requirements/squads`)
        ]);
        
        setRequirements(reqRes.data);
        setBuckets(bucketsRes.data);
        setSquads(squadsRes.data);
        
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setError(null);
    setSuccess(null);
  };
  
  // Filter requirements based on selected filters
  const filteredRequirements = requirements.filter(req => {
    let matchesBucket = bucketFilter === 'all' || req.bucket._id === bucketFilter;
    let matchesSquad = squadFilter === 'all' || req.squad._id === squadFilter;
    return matchesBucket && matchesSquad;
  });
  
  // Calculate total metrics
  const totalMetrics = filteredRequirements.reduce((acc, req) => {
    acc.revenue += req.metrics.revenueEstimate;
    acc.cost += req.metrics.costSaving;
    acc.effort += req.metrics.effortManDays;
    acc.sprints += req.metrics.sprintEstimate;
    return acc;
  }, { revenue: 0, cost: 0, effort: 0, sprints: 0 });
  
  // Calculate average ROI
  const averageROI = filteredRequirements.length > 0 
    ? filteredRequirements.reduce((sum, req) => sum + req.metrics.roi, 0) / filteredRequirements.length
    : 0;
  
  // Prepare data for ROI by Bucket chart
  const roiByBucketData = {
    labels: buckets.map(bucket => bucket.name),
    datasets: [
      {
        label: 'Average ROI',
        data: buckets.map(bucket => {
          const bucketReqs = filteredRequirements.filter(req => req.bucket._id === bucket._id);
          return bucketReqs.length > 0 
            ? bucketReqs.reduce((sum, req) => sum + req.metrics.roi, 0) / bucketReqs.length
            : 0;
        }),
        backgroundColor: buckets.map(bucket => bucket.color),
      },
    ],
  };
  
  // Prepare data for Effort by Squad chart
  const effortBySquadData = {
    labels: squads.map(squad => squad.name),
    datasets: [
      {
        label: 'Total Effort (Man-days)',
        data: squads.map(squad => {
          const squadReqs = filteredRequirements.filter(req => req.squad._id === squad._id);
          return squadReqs.reduce((sum, req) => sum + req.metrics.effortManDays, 0);
        }),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };
  
  // Prepare data for Requirements by Bucket pie chart
  const reqsByBucketData = {
    labels: buckets.map(bucket => bucket.name),
    datasets: [
      {
        data: buckets.map(bucket => 
          filteredRequirements.filter(req => req.bucket._id === bucket._id).length
        ),
        backgroundColor: buckets.map(bucket => bucket.color),
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare data for ROI vs Effort scatter plot
  const roiVsEffortData = {
    datasets: [
      {
        label: 'Requirements',
        data: filteredRequirements.map(req => ({
          x: req.metrics.effortManDays,
          y: req.metrics.roi,
          r: 10, // bubble size
        })),
        backgroundColor: filteredRequirements.map(req => {
          const bucket = buckets.find(b => b._id === req.bucket._id);
          return bucket ? bucket.color : '#000000';
        }),
      },
    ],
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Metrics by Category',
      },
    },
  };
  
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Requirements by Bucket',
      },
    },
  };
  
  const scatterOptions = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Effort (Man-days)',
        },
      },
      y: {
        title: {
          display: true,
          text: 'ROI',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const req = filteredRequirements[context.dataIndex];
            return [
              `Title: ${req.title}`,
              `ROI: ${req.metrics.roi.toFixed(2)}`,
              `Effort: ${req.metrics.effortManDays} man-days`,
            ];
          }
        }
      },
      title: {
        display: true,
        text: 'ROI vs Effort',
      },
    },
  };
  
  if (loading && requirements.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        ROI Calculation & Backlog Ordering
      </Typography>
      
      {/* Alerts */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleAlertClose}>
        <Alert onClose={handleAlertClose} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Filters</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Bucket</InputLabel>
              <Select
                value={bucketFilter}
                label="Bucket"
                onChange={(e) => setBucketFilter(e.target.value)}
              >
                <MenuItem value="all">All Buckets</MenuItem>
                {buckets.map((bucket) => (
                  <MenuItem key={bucket._id} value={bucket._id}>
                    {bucket.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Squad</InputLabel>
              <Select
                value={squadFilter}
                label="Squad"
                onChange={(e) => setSquadFilter(e.target.value)}
              >
                <MenuItem value="all">All Squads</MenuItem>
                {squads.map((squad) => (
                  <MenuItem key={squad._id} value={squad._id}>
                    {squad.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Requirements
              </Typography>
              <Typography variant="h4">
                {filteredRequirements.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average ROI
              </Typography>
              <Typography variant="h4">
                {averageROI.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Effort
              </Typography>
              <Typography variant="h4">
                {totalMetrics.effort.toFixed(1)} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Sprints
              </Typography>
              <Typography variant="h4">
                {totalMetrics.sprints}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for different views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Charts & Analytics" />
          <Tab label="Prioritized Backlog" />
        </Tabs>
      </Paper>
      
      {/* Tab Content */}
      {tabValue === 0 ? (
        <Grid container spacing={3}>
          {/* ROI by Bucket Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ROI by Bucket
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar options={barOptions} data={roiByBucketData} />
              </Box>
            </Paper>
          </Grid>
          
          {/* Effort by Squad Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Effort by Squad
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar options={barOptions} data={effortBySquadData} />
              </Box>
            </Paper>
          </Grid>
          
          {/* Requirements by Bucket Pie Chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Requirements by Bucket
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie options={pieOptions} data={reqsByBucketData} />
              </Box>
            </Paper>
          </Grid>
          
          {/* ROI vs Effort Scatter Plot */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                ROI vs Effort Analysis
              </Typography>
              <Box sx={{ height: 300 }}>
                <Scatter options={scatterOptions} data={roiVsEffortData} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Prioritized Backlog
          </Typography>
          
          {filteredRequirements.length === 0 ? (
            <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
              No requirements match the current filters.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">Priority</TableCell>
                    <TableCell width="25%">Title</TableCell>
                    <TableCell width="10%">Bucket</TableCell>
                    <TableCell width="10%">Squad</TableCell>
                    <TableCell width="10%">Revenue</TableCell>
                    <TableCell width="10%">Cost Saving</TableCell>
                    <TableCell width="10%">Effort</TableCell>
                    <TableCell width="10%">ROI</TableCell>
                    <TableCell width="10%">Sprints</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequirements
                    .sort((a, b) => a.priority - b.priority)
                    .map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>{req.priority}</TableCell>
                        <TableCell>{req.title}</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ 
                              bgcolor: req.bucket.color, 
                              color: 'white',
                              p: 0.5,
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {req.bucket.name}
                          </Box>
                        </TableCell>
                        <TableCell>{req.squad.name}</TableCell>
                        <TableCell>${req.metrics.revenueEstimate}</TableCell>
                        <TableCell>${req.metrics.costSaving}</TableCell>
                        <TableCell>{req.metrics.effortManDays} days</TableCell>
                        <TableCell>{req.metrics.roi.toFixed(2)}</TableCell>
                        <TableCell>{req.metrics.sprintEstimate}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
    </Container>
  );
};

export default ROICalculationScreen;
