import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import config from '../config';

const RequirementAdditionScreen = () => {
  // State for form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bucket, setBucket] = useState('');
  const [squad, setSquad] = useState('');
  const [revenueEstimate, setRevenueEstimate] = useState(0);
  const [costSaving, setCostSaving] = useState(0);
  const [clientCount, setClientCount] = useState(1);
  const [clientBoost, setClientBoost] = useState(1);
  const [effortManDays, setEffortManDays] = useState(1);
  const [costPerManDay, setCostPerManDay] = useState(config.DEFAULT_COST_PER_MANDAY);
  
  // State for calculated values
  const [roi, setRoi] = useState(0);
  const [sprintEstimate, setSprintEstimate] = useState(0);
  
  // State for data
  const [requirements, setRequirements] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [squads, setSquads] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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
        
        // Set default values if available
        if (bucketsRes.data.length > 0) {
          setBucket(bucketsRes.data[0]._id);
        }
        if (squadsRes.data.length > 0) {
          setSquad(squadsRes.data[0]._id);
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
  
  // Calculate ROI and sprint estimate when inputs change
  useEffect(() => {
    // ROI = ((Revenue + Cost) × Clients × Boost) / (Effort in man-days × Cost per man-day)
    const numerator = (revenueEstimate + costSaving) * clientCount * clientBoost;
    const denominator = effortManDays * costPerManDay;
    
    const calculatedRoi = denominator > 0 ? numerator / denominator : 0;
    setRoi(calculatedRoi);
    
    // Calculate sprint estimate (assuming 10 man-days per sprint for 1 FTE)
    const MANDAYS_PER_SPRINT = 10;
    const calculatedSprintEstimate = Math.ceil(effortManDays / MANDAYS_PER_SPRINT);
    setSprintEstimate(calculatedSprintEstimate);
  }, [revenueEstimate, costSaving, clientCount, clientBoost, effortManDays, costPerManDay]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !description || !bucket || !squad || effortManDays <= 0) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create new requirement
      const newRequirement = {
        title,
        description,
        bucket,
        squad,
        metrics: {
          revenueEstimate,
          costSaving,
          clientCount,
          clientBoost,
          effortManDays,
          costPerManDay,
          roi,
          sprintEstimate
        }
      };
      
      // Send to API
      const res = await axios.post(`${config.API_BASE_URL}/requirements`, newRequirement);
      
      // Refresh requirements list
      const updatedReqs = await axios.get(`${config.API_BASE_URL}/requirements`);
      setRequirements(updatedReqs.data);
      
      // Show success message
      setSuccess('Requirement added successfully');
      
      // Reset form
      resetForm();
      
    } catch (err) {
      setError('Failed to add requirement. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form inputs
  const resetForm = () => {
    setTitle('');
    setDescription('');
    // Don't reset bucket and squad to maintain user's context
    setRevenueEstimate(0);
    setCostSaving(0);
    setClientCount(1);
    setClientBoost(1);
    setEffortManDays(1);
    setCostPerManDay(config.DEFAULT_COST_PER_MANDAY);
  };
  
  // Handle drag and drop for manual prioritization
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(requirements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update priorities
    const updatedItems = items.map((item, index) => ({
      ...item,
      priority: index + 1
    }));
    
    setRequirements(updatedItems);
    
    // Update in backend
    try {
      await axios.put(`${config.API_BASE_URL}/requirements/prioritize`, {
        requirements: updatedItems.map(item => ({
          _id: item._id,
          priority: item.priority
        }))
      });
      
      setSuccess('Priorities updated successfully');
    } catch (err) {
      setError('Failed to update priorities. Please try again.');
      console.error(err);
    }
  };
  
  // Handle alert close
  const handleAlertClose = () => {
    setError(null);
    setSuccess(null);
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
        Requirement Addition & Prioritization
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
      
      <Grid container spacing={3}>
        {/* Requirement Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Requirement
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Bucket</InputLabel>
                        <Select
                          value={bucket}
                          label="Bucket"
                          onChange={(e) => setBucket(e.target.value)}
                        >
                          {buckets.map((b) => (
                            <MenuItem key={b._id} value={b._id}>
                              {b.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Squad</InputLabel>
                        <Select
                          value={squad}
                          label="Squad"
                          onChange={(e) => setSquad(e.target.value)}
                        >
                          {squads.map((s) => (
                            <MenuItem key={s._id} value={s._id}>
                              {s.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Metrics for ROI Calculation
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Revenue Estimate"
                    value={revenueEstimate}
                    onChange={(e) => setRevenueEstimate(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cost Saving"
                    value={costSaving}
                    onChange={(e) => setCostSaving(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Client Count"
                    value={clientCount}
                    onChange={(e) => setClientCount(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography gutterBottom>Client Boost (1-10)</Typography>
                  <Slider
                    value={clientBoost}
                    onChange={(e, newValue) => setClientBoost(newValue)}
                    step={1}
                    marks
                    min={1}
                    max={10}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Effort (Man-days)"
                    value={effortManDays}
                    onChange={(e) => setEffortManDays(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 0.5, step: 0.5 } }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Cost per Man-day"
                    value={costPerManDay}
                    onChange={(e) => setCostPerManDay(Number(e.target.value))}
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                    <Typography variant="subtitle1">
                      Calculated ROI: <strong>{roi.toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="subtitle1">
                      Sprint Estimate: <strong>{sprintEstimate}</strong> (based on 1 FTE)
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Button 
                    type="button" 
                    variant="outlined" 
                    sx={{ mr: 2 }}
                    onClick={resetForm}
                  >
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Add Requirement'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        {/* Requirements Backlog */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Requirements Backlog (Prioritized by ROI)
            </Typography>
            
            {requirements.length === 0 ? (
              <Typography variant="body1" sx={{ my: 4, textAlign: 'center' }}>
                No requirements added yet. Add your first requirement above.
              </Typography>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="requirements">
                  {(provided) => (
                    <TableContainer component={Paper} ref={provided.innerRef} {...provided.droppableProps}>
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
                          {requirements.map((req, index) => (
                            <Draggable key={req._id} draggableId={req._id} index={index}>
                              {(provided) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  sx={{ 
                                    '&:hover': { bgcolor: 'action.hover' },
                                    cursor: 'grab'
                                  }}
                                >
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
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              * Drag and drop to manually adjust priorities
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RequirementAdditionScreen;
