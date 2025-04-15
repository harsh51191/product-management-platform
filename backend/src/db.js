const mongoose = require('mongoose');
const Requirement = require('./models/Requirement');
const Bucket = require('./models/Bucket');
const Squad = require('./models/Squad');
const config = require('./config');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
    
    // Check if initial data needs to be seeded
    await seedInitialData();
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Seed initial data if collections are empty
const seedInitialData = async () => {
  try {
    // Check if buckets exist
    const bucketCount = await Bucket.countDocuments();
    if (bucketCount === 0) {
      console.log('Seeding initial buckets...');
      const buckets = [
        { name: 'Feature', description: 'New functionality to be added to the product' },
        { name: 'Bug', description: 'Issues that need to be fixed' },
        { name: 'Change', description: 'Modifications to existing functionality' },
        { name: 'Capability', description: 'Enhancements to existing features' }
      ];
      
      await Bucket.insertMany(buckets);
      console.log('Buckets seeded successfully');
    }
    
    // Check if squads exist
    const squadCount = await Squad.countDocuments();
    if (squadCount === 0) {
      console.log('Seeding initial squads...');
      const squads = [
        { name: 'Frontend', description: 'UI/UX development team' },
        { name: 'Backend', description: 'API and database team' },
        { name: 'DevOps', description: 'Infrastructure and deployment team' },
        { name: 'QA', description: 'Quality assurance team' }
      ];
      
      await Squad.insertMany(squads);
      console.log('Squads seeded successfully');
    }
    
    // Check if requirements exist
    const requirementCount = await Requirement.countDocuments();
    if (requirementCount === 0) {
      console.log('Seeding sample requirements...');
      
      // Get bucket and squad IDs
      const featureBucket = await Bucket.findOne({ name: 'Feature' });
      const frontendSquad = await Squad.findOne({ name: 'Frontend' });
      
      if (featureBucket && frontendSquad) {
        const requirements = [
          {
            title: 'User Authentication System',
            description: 'Implement a secure user authentication system with login, registration, and password reset functionality.',
            bucket: featureBucket._id,
            squad: frontendSquad._id,
            priority: 1,
            status: 'Proposed',
            metrics: {
              revenueEstimate: 50000,
              costSaving: 20000,
              clientCount: 100,
              clientBoost: 1.5,
              effortManDays: 20,
              costPerManDay: 500
            }
          },
          {
            title: 'Dashboard Analytics',
            description: 'Create a dashboard with key performance indicators and analytics visualizations.',
            bucket: featureBucket._id,
            squad: frontendSquad._id,
            priority: 2,
            status: 'Proposed',
            metrics: {
              revenueEstimate: 75000,
              costSaving: 30000,
              clientCount: 80,
              clientBoost: 2.0,
              effortManDays: 15,
              costPerManDay: 500
            }
          }
        ];
        
        await Requirement.insertMany(requirements);
        console.log('Sample requirements seeded successfully');
      }
    }
    
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
};

module.exports = connectDB;
