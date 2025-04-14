// Frontend Configuration
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  
  // Authentication
  TOKEN_KEY: 'product_management_token',
  
  // ROI Calculation Constants
  DEFAULT_COST_PER_MANDAY: 500, // Default cost per man-day in currency units
  
  // Bucket Types
  BUCKET_TYPES: ['Feature', 'Bug', 'Change', 'Capability'],
  
  // Default values
  DEFAULT_CLIENT_BOOST: 1,
  
  // Pagination
  ITEMS_PER_PAGE: 10,
};

export default config;
