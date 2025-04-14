import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import config from '../config';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    requirements: 0,
    prds: 0,
    testCases: 0
  });
  const [recentRequirements, setRecentRequirements] = useState([]);
  const [recentPRDs, setRecentPRDs] = useState([]);
  const [recentTestCases, setRecentTestCases] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch requirements
        const reqRes = await axios.get(`${config.API_BASE_URL}/requirements`);
        setRecentRequirements(reqRes.data.slice(0, 5));
        
        // Fetch PRDs
        const prdRes = await axios.get(`${config.API_BASE_URL}/prd`);
        setRecentPRDs(prdRes.data.slice(0, 5));
        
        // Fetch test cases
        const testRes = await axios.get(`${config.API_BASE_URL}/test-cases`);
        setRecentTestCases(testRes.data.slice(0, 5));
        
        // Set stats
        setStats({
          requirements: reqRes.data.length,
          prds: prdRes.data.length,
          testCases: testRes.data.length
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Product Management Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.requirements}
              </Typography>
              <Typography color="text.secondary">
                Requirements
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="/requirements">View All</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.prds}
              </Typography>
              <Typography color="text.secondary">
                PRDs Generated
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="/prd">Generate More</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {stats.testCases}
              </Typography>
              <Typography color="text.secondary">
                Test Cases
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href="/test-cases">Generate More</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Items */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Requirements
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentRequirements.length > 0 ? (
              <List>
                {recentRequirements.map((req) => (
                  <ListItem key={req._id} divider>
                    <ListItemText 
                      primary={req.title} 
                      secondary={`Priority: ${req.priority} | ROI: ${req.roi?.toFixed(2) || 'N/A'}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No requirements added yet
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent PRDs
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentPRDs.length > 0 ? (
              <List>
                {recentPRDs.map((prd) => (
                  <ListItem key={prd._id} divider>
                    <ListItemText 
                      primary={prd.title} 
                      secondary={`Created: ${new Date(prd.createdAt).toLocaleDateString()}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No PRDs generated yet
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Test Cases
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {recentTestCases.length > 0 ? (
              <List>
                {recentTestCases.map((tc) => (
                  <ListItem key={tc._id} divider>
                    <ListItemText 
                      primary={tc.title} 
                      secondary={`Steps: ${tc.steps?.length || 0}`} 
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No test cases generated yet
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Quick Links */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              href="/requirements"
            >
              Add New Requirement
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="secondary" 
              fullWidth
              href="/roi-calculation"
            >
              View ROI Analytics
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button 
              variant="contained" 
              color="info" 
              fullWidth
              href="/prd"
            >
              Generate PRD
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DashboardScreen;
