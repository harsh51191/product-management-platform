const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// PRD Schema
const PRDSchema = new Schema({
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
  overview: {
    type: String,
    required: [true, 'Overview is required']
  },
  userStories: [{
    type: String
  }],
  uiDesign: {
    type: String,
    required: [true, 'UI design description is required']
  },
  backendLogic: {
    type: String,
    required: [true, 'Backend logic description is required']
  },
  diagrams: [{
    type: String // Mermaid diagram code
  }],
  solutionDelta: {
    type: String,
    required: [true, 'Solution delta is required']
  },
  deltaPrototypes: {
    currentState: {
      type: String,
      default: 'Not provided'
    },
    proposedChanges: {
      type: String,
      default: 'Not provided'
    },
    userFlow: {
      type: String,
      default: 'Not provided'
    },
    apiLinkages: {
      type: String,
      default: 'Not provided'
    },
    cornerCases: {
      type: String,
      default: 'Not provided'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedBy: {
    provider: {
      type: String,
      default: 'openai'
    },
    model: {
      type: String,
      default: 'gpt-3.5-turbo'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PRD', PRDSchema);
