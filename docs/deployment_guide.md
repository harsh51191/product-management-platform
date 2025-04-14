# Product Management Platform - Deployment Guide

## System Requirements

### Server Requirements
- Node.js 16.x or higher
- MongoDB 4.4 or higher
- 2GB RAM minimum (4GB recommended)
- 10GB disk space

### Client Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Minimum screen resolution: 1280x720

## Installation Instructions

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd product-management-platform
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the MongoDB connection string
   - Add API keys for OpenAI, Anthropic, and Gemini (optional)
   ```bash
   cp .env.example .env
   nano .env  # Edit the file with your settings
   ```

4. **Start the backend server**
   ```bash
   npm start
   ```
   For production deployment:
   ```bash
   npm run start:prod
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

2. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the API base URL to point to your backend
   ```bash
   cp .env.example .env
   nano .env  # Edit the file with your settings
   ```

3. **Build the frontend**
   ```bash
   npm run build
   ```

4. **Serve the frontend**
   For development:
   ```bash
   npm start
   ```
   For production, serve the build directory with a static file server:
   ```bash
   npx serve -s build
   ```

## Deployment Options

### Option 1: Local Deployment
- Follow the installation instructions above
- Access the application at http://localhost:3000

### Option 2: Docker Deployment
1. **Build Docker images**
   ```bash
   docker-compose build
   ```

2. **Start containers**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Option 3: Cloud Deployment

#### AWS Deployment
1. Set up an EC2 instance with Node.js
2. Set up MongoDB Atlas or use Amazon DocumentDB
3. Deploy the backend using PM2
4. Deploy the frontend to S3 + CloudFront

#### Heroku Deployment
1. Create a Heroku account
2. Create two Heroku apps (backend and frontend)
3. Set up MongoDB Atlas
4. Configure environment variables in Heroku dashboard
5. Deploy using Heroku CLI or GitHub integration

## Database Setup

The application will automatically seed initial data on first run, including:
- Default buckets (Feature, Bug, Change, Capability)
- Default squads (Frontend, Backend, DevOps, QA)
- Sample requirements

To manually seed the database:
```bash
cd backend
node src/seed.js
```

## Security Considerations

1. **API Keys**: Store API keys securely in environment variables
2. **Authentication**: Implement user authentication before exposing to public networks
3. **HTTPS**: Always use HTTPS in production environments
4. **Rate Limiting**: Consider implementing rate limiting for API endpoints
5. **Data Backup**: Regularly backup your MongoDB database

## Monitoring and Maintenance

1. **Logging**: The application uses Morgan for HTTP request logging
2. **Error Tracking**: Consider integrating Sentry or similar error tracking service
3. **Performance Monitoring**: Use New Relic or similar for performance monitoring
4. **Updates**: Regularly update dependencies for security patches

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Check MongoDB connection string
   - Verify MongoDB service is running
   - Check network connectivity and firewall settings

2. **API Provider Issues**
   - Verify API keys are correctly set
   - Check API provider service status
   - Review API rate limits

3. **Frontend Not Loading**
   - Check browser console for errors
   - Verify API base URL is correctly set
   - Clear browser cache

## Support

For additional deployment support, please contact the development team.

---

Thank you for deploying the Product Management Platform!
