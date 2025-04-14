# Database Schema Design

## Overview
This document outlines the database schema design for the Product Management Platform, focusing on the requirements management system, ROI calculation, and related components.

## Collections

### 1. Requirements
```javascript
{
  _id: ObjectId,
  title: String,                // Title of the requirement
  description: String,          // Detailed description
  bucket: {                     // Classification bucket
    type: String,               // Enum: 'Feature', 'Bug', 'Change', 'Capability'
    ref: 'Bucket'
  },
  squad: {                      // Assigned squad
    type: ObjectId,
    ref: 'Squad'
  },
  metrics: {
    revenueEstimate: Number,    // Estimated revenue impact
    costSaving: Number,         // Estimated cost savings
    clientCount: Number,        // Number of clients affected
    clientBoost: Number,        // Multiplier for client impact (1-10)
    effortManDays: Number,      // Estimated effort in man-days
    costPerManDay: Number,      // Cost per man-day
    roi: Number,                // Calculated ROI
    sprintEstimate: Number      // Estimated sprints (based on 1 FTE)
  },
  priority: Number,             // Auto-calculated priority based on ROI
  status: {
    type: String,               // Enum: 'Proposed', 'Approved', 'In Progress', 'Completed', 'Rejected'
    default: 'Proposed'
  },
  createdBy: {
    type: ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date,
  prd: {                        // Reference to PRD if generated
    type: ObjectId,
    ref: 'PRD'
  },
  testCases: [{                 // References to test cases if generated
    type: ObjectId,
    ref: 'TestCase'
  }]
}
```

### 2. Buckets
```javascript
{
  _id: ObjectId,
  name: String,                 // Enum: 'Feature', 'Bug', 'Change', 'Capability'
  description: String,
  color: String,                // For UI display
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Squads
```javascript
{
  _id: ObjectId,
  name: String,                 // Squad name
  description: String,
  members: [{                   // Team members
    type: ObjectId,
    ref: 'User'
  }],
  capacity: Number,             // Capacity in man-days per sprint
  createdAt: Date,
  updatedAt: Date
}
```

### 4. PRDs (Product Requirement Documents)
```javascript
{
  _id: ObjectId,
  requirement: {
    type: ObjectId,
    ref: 'Requirement'
  },
  title: String,
  overview: String,
  userStories: [String],
  uiDesign: String,             // UI mockup/wireframe description
  backendLogic: String,         // Backend logic description
  diagrams: [String],           // Mermaid diagram code
  solutionDelta: String,        // Comparison with existing product
  createdBy: {
    type: ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 5. TestCases
```javascript
{
  _id: ObjectId,
  requirement: {
    type: ObjectId,
    ref: 'Requirement'
  },
  title: String,
  description: String,
  preconditions: [String],
  steps: [{
    stepNumber: Number,
    action: String,
    expectedResult: String
  }],
  createdBy: {
    type: ObjectId,
    ref: 'User'
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,             // Hashed
  role: String,                 // Enum: 'Admin', 'Manager', 'Developer', 'Tester'
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships
- Requirements belong to a Bucket and Squad
- Requirements can have one PRD
- Requirements can have multiple TestCases
- Squads can have multiple members (Users)
- Users can create Requirements, PRDs, and TestCases

## Indexes
- Requirements: bucket, squad, priority, status
- PRDs: requirement
- TestCases: requirement
- Users: email (unique)

## ROI Calculation Logic
The ROI is calculated using the formula:
```
ROI = ((Revenue + Cost) × Clients × Boost) / (Effort in man-days × Cost per man-day)
```

Where:
- Revenue: Estimated revenue impact
- Cost: Estimated cost savings
- Clients: Number of clients affected
- Boost: Client impact multiplier (1-10)
- Effort: Estimated effort in man-days
- Cost per man-day: Standard cost per man-day

This calculation will be implemented in the Requirement model's pre-save middleware to ensure ROI is always up-to-date.
