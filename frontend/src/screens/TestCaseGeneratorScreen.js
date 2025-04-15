import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import config from '../config';

const TestCaseGeneratorScreen = () => {
  // State for requirement selection
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState('');
  
  // State for AI provider selection
  const [providers, setProviders] = useState({});
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [apiKey, setApiKey] = useState('');
  
  // State for test case generation
  const [testCases, setTestCases] = useState([]);
  const [generating, setGenerating] = useState(false);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, providersRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/requirements`),
          axios.get(`${config.API_BASE_URL}/ai-providers`) // Reuse providers endpoint from PRD
        ]);
        
        // Filter requirements that have a PRD but no test cases yet
        const filteredReqs = reqRes.data.filter(req => req.prd && (!req.testCases || req.testCases.length === 0));
        setRequirements(filteredReqs);
        
        setProviders(providersRes.data);
        
        // Set default model based on selected provider
        if (providersRes.data[selectedProvider] && providersRes.data[selectedProvider].models.length > 0) {
          setSelectedModel(providersRes.data[selectedProvider].models[0]);
        }
        
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update selected model when provider changes
  useEffect(() => {
    if (providers[selectedProvider] && providers[selectedProvider].models.length > 0) {
      setSelectedModel(providers[selectedProvider].models[0]);
    }
  }, [selectedProvider, providers]);
  
  // Handle alert close
  const handleAlertClose = () => {
    setError(null);
    setSuccess(null);
  };
  
  // Handle test case generation
  const handleGenerateTestCases = async () => {
    if (!selectedRequirement) {
      setError('Please select a requirement');
      return;
    }
    
    setGenerating(true);
    
    try {
      const res = await axios.post(`${config.API_BASE_URL}/test-cases/generate`, {
        requirementId: selectedRequirement,
        providerId: selectedProvider,
        modelId: selectedModel,
        apiKey: apiKey || undefined
      });
      
      setTestCases(res.data);
      setSuccess('Test cases generated successfully');
      
      // Refresh requirements list to remove the one that now has test cases
      const reqRes = await axios.get(`${config.API_BASE_URL}/requirements`);
      const filteredReqs = reqRes.data.filter(req => req.prd && (!req.testCases || req.testCases.length === 0));
      setRequirements(filteredReqs);
      
      // Reset selection
      setSelectedRequirement('');
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate test cases. Please try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };
  
  // Handle test case selection
  const handleTestCaseSelect = (testCase) => {
    setSelectedTestCase(testCase);
  };
  
  // Export test cases to CSV
  const exportToCSV = () => {
    if (testCases.length === 0) return;
    
    // Create CSV content
    let csvContent = "Title,Description,Preconditions,Step Number,Action,Expected Result\n";
    
    testCases.forEach(tc => {
      // For each step, create a row
      tc.steps.forEach(step => {
        const row = [
          `"${tc.title.replace(/"/g, '""')}"`,
          `"${tc.description.replace(/"/g, '""')}"`,
          `"${tc.preconditions.join(', ').replace(/"/g, '""')}"`,
          step.stepNumber,
          `"${step.action.replace(/"/g, '""')}"`,
          `"${step.expectedResult.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
      });
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'test_cases.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        Test Case Generator
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
      
      {/* Test Case Generation Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Test Cases for Requirement
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Requirement with PRD</InputLabel>
              <Select
                value={selectedRequirement}
                label="Requirement with PRD"
                onChange={(e) => setSelectedRequirement(e.target.value)}
                disabled={generating}
              >
                {requirements.length === 0 ? (
                  <MenuItem value="" disabled>
                    No requirements available
                  </MenuItem>
                ) : (
                  requirements.map((req) => (
                    <MenuItem key={req._id} value={req._id}>
                      {req.title}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>AI Provider</InputLabel>
              <Select
                value={selectedProvider}
                label="AI Provider"
                onChange={(e) => setSelectedProvider(e.target.value)}
                disabled={generating}
              >
                {Object.keys(providers).map((providerId) => (
                  <MenuItem key={providerId} value={providerId}>
                    {providers[providerId].name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Model</InputLabel>
              <Select
                value={selectedModel}
                label="Model"
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={generating || !providers[selectedProvider]}
              >
                {providers[selectedProvider]?.models.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="API Key (Optional)"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={generating}
              helperText={`Optional: Provide your own ${providers[selectedProvider]?.name} API key`}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateTestCases}
              disabled={generating || !selectedRequirement}
              startIcon={generating ? <CircularProgress size={20} /> : null}
            >
              {generating ? 'Generating...' : 'Generate Test Cases'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Test Cases Display */}
      {testCases.length > 0 && (
        <Grid container spacing={3}>
          {/* Test Case List */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Test Cases
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={exportToCSV}
                >
                  Export CSV
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {testCases.map((testCase, index) => (
                  <ListItem 
                    key={testCase._id || index} 
                    button 
                    onClick={() => handleTestCaseSelect(testCase)}
                    selected={selectedTestCase === testCase}
                    divider
                  >
                    <ListItemText 
                      primary={testCase.title} 
                      secondary={`${testCase.steps.length} steps`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          {/* Test Case Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {selectedTestCase ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {selectedTestCase.title}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {selectedTestCase.description}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Preconditions:
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {selectedTestCase.preconditions.map((precondition, index) => (
                      <Chip 
                        key={index} 
                        label={precondition} 
                        sx={{ mr: 1, mb: 1 }} 
                        variant="outlined" 
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Test Steps:
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="10%">#</TableCell>
                          <TableCell width="45%">Action</TableCell>
                          <TableCell width="45%">Expected Result</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedTestCase.steps.map((step) => (
                          <TableRow key={step.stepNumber}>
                            <TableCell>{step.stepNumber}</TableCell>
                            <TableCell>{step.action}</TableCell>
                            <TableCell>{step.expectedResult}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body1" color="textSecondary">
                    Select a test case to view details
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default TestCaseGeneratorScreen;
