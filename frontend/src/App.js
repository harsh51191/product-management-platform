import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  AddCircle as AddIcon,
  Description as DescriptionIcon,
  BugReport as TestIcon
} from '@mui/icons-material';
import RequirementAdditionScreen from './screens/RequirementAdditionScreen';
import ROICalculationScreen from './screens/ROICalculationScreen';
import PRDGeneratorScreen from './screens/PRDGeneratorScreen';
import TestCaseGeneratorScreen from './screens/TestCaseGeneratorScreen';
import DashboardScreen from './screens/DashboardScreen';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Drawer width
const drawerWidth = 240;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          {/* App Bar */}
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" noWrap component="div">
                Product Management Platform
              </Typography>
            </Toolbar>
          </AppBar>
          
          {/* Sidebar */}
          <Drawer
            variant="permanent"
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                <ListItem button component="a" href="/">
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button component="a" href="/requirements">
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Requirements" />
                </ListItem>
                <ListItem button component="a" href="/roi-calculation">
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="ROI Analytics" />
                </ListItem>
                <Divider />
                <ListItem button component="a" href="/prd">
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText primary="PRD Generator" />
                </ListItem>
                <ListItem button component="a" href="/test-cases">
                  <ListItemIcon>
                    <TestIcon />
                  </ListItemIcon>
                  <ListItemText primary="Test Cases" />
                </ListItem>
              </List>
            </Box>
          </Drawer>
          
          {/* Main Content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
              <Routes>
                <Route path="/" element={<DashboardScreen />} />
                <Route path="/dashboard" element={<DashboardScreen />} />
                <Route path="/requirements" element={<RequirementAdditionScreen />} />
                <Route path="/roi-calculation" element={<ROICalculationScreen />} />
                <Route path="/prd" element={<PRDGeneratorScreen />} />
                <Route path="/test-cases" element={<TestCaseGeneratorScreen />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

// Placeholder for screens not yet implemented
const ComingSoon = ({ title }) => (
  <Box sx={{ textAlign: 'center', mt: 10 }}>
    <Typography variant="h4" gutterBottom>
      {title}
    </Typography>
    <Typography variant="body1">
      This feature is coming soon. We're working on it!
    </Typography>
  </Box>
);

export default App;
