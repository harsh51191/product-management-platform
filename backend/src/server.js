const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Routes
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/prd', require('./routes/prd'));
app.use('/api/test-cases', require('./routes/test-cases'));
app.use('/api/ai-providers', require('./routes/ai-providers'));

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
