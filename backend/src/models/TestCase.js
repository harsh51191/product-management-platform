const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TestCase Schema
const TestCaseSchema = new Schema({
  requirement: {
    type: Schema.Types.ObjectId,
    ref: 'Requirement',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  preconditions: [{
    type: String
  }],
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    expectedResult: {
      type: String,
      required: true
    }
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TestCase', TestCaseSchema);
