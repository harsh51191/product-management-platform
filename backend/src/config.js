// Backend Configuration
require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/product-management',
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'product-management-secret-key',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // OpenAI Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  
  // ROI Calculation Constants
  DEFAULT_COST_PER_MANDAY: 500, // Default cost per man-day in currency units
  
  // Bucket Types
  BUCKET_TYPES: ['Feature', 'Bug', 'Change', 'Capability'],
  
  // Default values
  DEFAULT_CLIENT_BOOST: 1,
  
  // Pagination
  ITEMS_PER_PAGE: 10,
};
