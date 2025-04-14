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
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import mermaid from 'mermaid';
import config from '../config';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'neutral',
  securityLevel: 'loose',
});

const PRDGeneratorScreen = () => {
  // State for requirement selection
  const [requirements, setRequirements] = useState([]);
  const [selectedRequirement, setSelectedRequirement] = useState('');
  
  // State for AI provider selection
  const [providers, setProviders] = useState({});
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // State for PRD generation
  const [prd, setPRD] = useState(null);
  const [generating, setGenerating] = useState(false);
  
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
        const [reqRes, providersRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/requirements`),
          axios.get(`${config.API_BASE_URL}/prd/providers`)
        ]);
        
        // Filter requirements that don't have a PRD yet
        const filteredReqs = reqRes.data.filter(req => !req.prd);
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
  
  // Render mermaid diagrams when PRD changes
  useEffect(() => {
    if (prd && prd.diagrams && prd.diagrams.length > 0) {
      mermaid.init(undefined, document.querySelectorAll('.mermaid'));
    }
  }, [prd, tabValue]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setError(null);
    setSuccess(null);
  };
  
  // Handle PRD generation
  const handleGeneratePRD = async () => {
    if (!selectedRequirement) {
      setError('Please select a requirement');
      return;
    }
    
    setGenerating(true);
    
    try {
      const res = await axios.post(`${config.API_BASE_URL}/prd/generate`, {
        requirementId: selectedRequirement,
        providerId: selectedProvider,
        modelId: selectedModel,
        apiKey: apiKey || undefined
      });
      
      setPRD(res.data);
      setSuccess('PRD generated successfully');
      
      // Refresh requirements list to remove the one that now has a PRD
      const reqRes = await axios.get(`${config.API_BASE_URL}/requirements`);
      const filteredReqs = reqRes.data.filter(req => !req.prd);
      setRequirements(filteredReqs);
      
      // Reset selection
      setSelectedRequirement('');
      
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to generate PRD. Please try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
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
        PRD & Solution Generator
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
      
      {/* PRD Generation Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate PRD for Requirement
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Requirement</InputLabel>
              <Select
                value={selectedRequirement}
                label="Requirement"
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
              onClick={handleGeneratePRD}
              disabled={generating || !selectedRequirement}
              startIcon={generating ? <CircularProgress size={20} /> : null}
            >
              {generating ? 'Generating...' : 'Generate PRD'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* PRD Display */}
      {prd && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            {prd.title}
          </Typography>
          
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3 }}
          >
            <Tab label="Overview" />
            <Tab label="User Stories" />
            <Tab label="UI Design" />
            <Tab label="Backend Logic" />
            <Tab label="Diagrams" />
            <Tab label="Solution Delta" />
            <Tab label="Delta Prototypes" />
          </Tabs>
          
          {/* Overview */}
          {tabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {prd.overview}
              </Typography>
            </Box>
          )}
          
          {/* User Stories */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                User Stories
              </Typography>
              <List>
                {prd.userStories.map((story, index) => (
                  <ListItem key={index} divider={index < prd.userStories.length - 1}>
                    <ListItemText primary={story} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          
          {/* UI Design */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                UI Design
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {prd.uiDesign}
              </Typography>
            </Box>
          )}
          
          {/* Backend Logic */}
          {tabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Backend Logic (React Rendering)
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {prd.backendLogic}
              </Typography>
            </Box>
          )}
          
          {/* Diagrams */}
          {tabValue === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Diagrams
              </Typography>
              
              <Grid container spacing={3}>
                {prd.diagrams.map((diagram, index) => (
                  <Grid item xs={12} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          Diagram {index + 1}
                        </Typography>
                        <Box sx={{ overflow: 'auto' }}>
                          <div className="mermaid">{diagram}</div>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {/* Solution Delta */}
          {tabValue === 5 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Solution Delta
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {prd.solutionDelta}
              </Typography>
            </Box>
          )}
          
          {/* Delta Prototypes */}
          {tabValue === 6 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Delta Prototypes
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Current State</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {prd.deltaPrototypes?.currentState || 'Not provided'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Proposed Changes</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {prd.deltaPrototypes?.proposedChanges || 'Not provided'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">User Flow</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {prd.deltaPrototypes?.userFlow || 'Not provided'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">API Linkages</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {prd.deltaPrototypes?.apiLinkages || 'Not provided'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Corner Cases</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {prd.deltaPrototypes?.cornerCases || 'Not provided'}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
          
          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="caption" color="textSecondary">
              Generated using {prd.generatedBy?.provider || 'AI'} / {prd.generatedBy?.model || 'unknown model'}
            </Typography>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default PRDGeneratorScreen;
