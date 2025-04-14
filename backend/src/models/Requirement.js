const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Requirement Schema
const RequirementSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  bucket: {
    type: Schema.Types.ObjectId,
    ref: 'Bucket',
    required: [true, 'Bucket is required']
  },
  squad: {
    type: Schema.Types.ObjectId,
    ref: 'Squad',
    required: [true, 'Squad is required']
  },
  metrics: {
    revenueEstimate: {
      type: Number,
      default: 0
    },
    costSaving: {
      type: Number,
      default: 0
    },
    clientCount: {
      type: Number,
      default: 1
    },
    clientBoost: {
      type: Number,
      default: 1,
      min: 1,
      max: 10
    },
    effortManDays: {
      type: Number,
      required: [true, 'Effort in man-days is required'],
      min: 0.5
    },
    costPerManDay: {
      type: Number,
      default: 500
    },
    roi: {
      type: Number,
      default: 0
    },
    sprintEstimate: {
      type: Number,
      default: 0
    }
  },
  priority: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Proposed', 'Approved', 'In Progress', 'Completed', 'Rejected'],
    default: 'Proposed'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  prd: {
    type: Schema.Types.ObjectId,
    ref: 'PRD'
  },
  testCases: [{
    type: Schema.Types.ObjectId,
    ref: 'TestCase'
  }]
}, {
  timestamps: true
});

// Pre-save middleware to calculate ROI and sprint estimate
RequirementSchema.pre('save', function(next) {
  // Calculate ROI
  const { revenueEstimate, costSaving, clientCount, clientBoost, effortManDays, costPerManDay } = this.metrics;
  
  // ROI = ((Revenue + Cost) × Clients × Boost) / (Effort in man-days × Cost per man-day)
  const numerator = (revenueEstimate + costSaving) * clientCount * clientBoost;
  const denominator = effortManDays * costPerManDay;
  
  // Avoid division by zero
  if (denominator > 0) {
    this.metrics.roi = numerator / denominator;
  } else {
    this.metrics.roi = 0;
  }
  
  // Calculate sprint estimate (assuming 10 man-days per sprint for 1 FTE)
  const MANDAYS_PER_SPRINT = 10;
  this.metrics.sprintEstimate = Math.ceil(effortManDays / MANDAYS_PER_SPRINT);
  
  next();
});

module.exports = mongoose.model('Requirement', RequirementSchema);
