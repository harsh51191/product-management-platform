const express = require('express');
const router = express.Router();
const TestCase = require('../models/TestCase');
const Requirement = require('../models/Requirement');
const PRD = require('../models/PRD');
const AIProviderService = require('../services/AIProviderService');

// @route   GET /api/test-cases
// @desc    Get all test cases
// @access  Public
router.get('/', async (req, res) => {
  try {
    const testCases = await TestCase.find()
      .populate('requirement')
      .populate('createdBy');
    
    res.json(testCases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/test-cases/:id
// @desc    Get test case by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const testCase = await TestCase.findById(req.params.id)
      .populate('requirement')
      .populate('createdBy');
    
    if (!testCase) {
      return res.status(404).json({ msg: 'Test case not found' });
    }
    
    res.json(testCase);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Test case not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/test-cases/generate
// @desc    Generate test cases for a requirement
// @access  Public
router.post('/generate', async (req, res) => {
  try {
    const { requirementId, providerId, modelId, apiKey } = req.body;
    
    // Get requirement details
    const requirement = await Requirement.findById(requirementId)
      .populate('bucket')
      .populate('squad');
    
    if (!requirement) {
      return res.status(404).json({ msg: 'Requirement not found' });
    }
    
    // Get PRD if available
    const prd = await PRD.findOne({ requirement: requirementId });
    
    // Generate test cases using AI provider
    const testCasesContent = await generateTestCases(
      requirement, 
      prd, 
      providerId, 
      modelId, 
      apiKey
    );
    
    // Create test cases
    const testCases = [];
    
    for (const tc of testCasesContent) {
      const newTestCase = new TestCase({
        requirement: requirementId,
        title: tc.title,
        description: tc.description,
        preconditions: tc.preconditions,
        steps: tc.steps,
        // createdBy will be added when authentication is implemented
      });
      
      await newTestCase.save();
      
      // Add to test cases array
      testCases.push(newTestCase);
      
      // Add to requirement's test cases
      if (!requirement.testCases) {
        requirement.testCases = [];
      }
      requirement.testCases.push(newTestCase._id);
    }
    
    // Save requirement
    await requirement.save();
    
    // Return the newly created test cases
    const populatedTestCases = await TestCase.find({ _id: { $in: testCases.map(tc => tc._id) } })
      .populate('requirement');
    
    res.json(populatedTestCases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Helper function to generate test cases
const generateTestCases = async (requirement, prd, providerId, modelId, apiKey) => {
  try {
    // Create prompt based on requirement and PRD
    const prompt = createTestCasePrompt(requirement, prd);
    
    // Use AI provider service to generate test cases
    const response = await AIProviderService.generateContent(
      prompt,
      providerId,
      modelId,
      apiKey
    );
    
    // Parse response
    return response.testCases;
  } catch (error) {
    console.error('Error generating test cases:', error);
    
    // Return default test cases if AI fails
    return [
      {
        title: `Basic Functionality Test for ${requirement.title}`,
        description: `Verify that the basic functionality of ${requirement.title} works as expected.`,
        preconditions: ['User is logged in', 'User has appropriate permissions'],
        steps: [
          {
            stepNumber: 1,
            action: 'Navigate to the feature',
            expectedResult: 'Feature is accessible'
          },
          {
            stepNumber: 2,
            action: 'Perform basic operation',
            expectedResult: 'Operation completes successfully'
          },
          {
            stepNumber: 3,
            action: 'Verify results',
            expectedResult: 'Results are as expected'
          }
        ]
      },
      {
        title: `Error Handling Test for ${requirement.title}`,
        description: `Verify that errors are handled properly in ${requirement.title}.`,
        preconditions: ['User is logged in', 'User has appropriate permissions'],
        steps: [
          {
            stepNumber: 1,
            action: 'Navigate to the feature',
            expectedResult: 'Feature is accessible'
          },
          {
            stepNumber: 2,
            action: 'Attempt an invalid operation',
            expectedResult: 'System shows appropriate error message'
          },
          {
            stepNumber: 3,
            action: 'Verify system state',
            expectedResult: 'System remains in a consistent state'
          }
        ]
      }
    ];
  }
};

// Create prompt for test case generation
const createTestCasePrompt = (requirement, prd) => {
  let prompt = `
  Generate comprehensive test cases for the following requirement:
  
  Title: ${requirement.title}
  Description: ${requirement.description}
  Type: ${requirement.bucket.name}
  Team: ${requirement.squad.name}
  `;
  
  if (prd) {
    prompt += `
    
    Additional PRD information:
    Overview: ${prd.overview}
    UI Design: ${prd.uiDesign}
    Backend Logic: ${prd.backendLogic}
    Solution Delta: ${prd.solutionDelta}
    `;
    
    if (prd.deltaPrototypes) {
      prompt += `
      Delta Prototypes:
      Current State: ${prd.deltaPrototypes.currentState}
      Proposed Changes: ${prd.deltaPrototypes.proposedChanges}
      User Flow: ${prd.deltaPrototypes.userFlow}
      API Linkages: ${prd.deltaPrototypes.apiLinkages}
      Corner Cases: ${prd.deltaPrototypes.cornerCases}
      `;
    }
  }
  
  prompt += `
  
  Please generate at least 5 test cases covering:
  1. Basic functionality
  2. Edge cases
  3. Error handling
  4. Performance considerations
  5. Integration with other components
  
  Format the response as a JSON object with the following structure:
  {
    "testCases": [
      {
        "title": "string",
        "description": "string",
        "preconditions": ["string", "string", ...],
        "steps": [
          {
            "stepNumber": number,
            "action": "string",
            "expectedResult": "string"
          },
          ...
        ]
      },
      ...
    ]
  }
  `;
  
  return prompt;
};

module.exports = router;
