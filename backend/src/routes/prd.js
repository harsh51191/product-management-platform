const express = require('express');
const router = express.Router();
const PRD = require('../models/PRD');
const Requirement = require('../models/Requirement');
const AIProviderService = require('../services/AIProviderService');
const config = require('../config');

// @route   GET /api/prd
// @desc    Get all PRDs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const prds = await PRD.find()
      .populate('requirement')
      .populate('createdBy');
    
    res.json(prds);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/prd/:id
// @desc    Get PRD by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const prd = await PRD.findById(req.params.id)
      .populate('requirement')
      .populate('createdBy');
    
    if (!prd) {
      return res.status(404).json({ msg: 'PRD not found' });
    }
    
    res.json(prd);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'PRD not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/prd/generate
// @desc    Generate a new PRD
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
    
    // Check if PRD already exists
    const existingPRD = await PRD.findOne({ requirement: requirementId });
    if (existingPRD) {
      return res.status(400).json({ msg: 'PRD already exists for this requirement' });
    }
    
    // Generate PRD content using selected AI provider
    const prdContent = await AIProviderService.generatePRDContent(
      requirement, 
      providerId, 
      modelId, 
      apiKey
    );
    
    // Create new PRD
    const newPRD = new PRD({
      requirement: requirementId,
      title: `PRD: ${requirement.title}`,
      overview: prdContent.overview,
      userStories: prdContent.userStories,
      uiDesign: prdContent.uiDesign,
      backendLogic: prdContent.backendLogic,
      diagrams: prdContent.diagrams,
      solutionDelta: prdContent.solutionDelta,
      deltaPrototypes: prdContent.deltaPrototypes || {
        currentState: "Not provided",
        proposedChanges: "Not provided",
        userFlow: "Not provided",
        apiLinkages: "Not provided",
        cornerCases: "Not provided"
      },
      // createdBy will be added when authentication is implemented
    });
    
    // Save PRD
    await newPRD.save();
    
    // Update requirement with PRD reference
    requirement.prd = newPRD._id;
    await requirement.save();
    
    // Return the newly created PRD
    const populatedPRD = await PRD.findById(newPRD._id)
      .populate('requirement');
    
    res.json(populatedPRD);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @desc    Get all available AI providers
// @access  Public
router.get('/ai-config', (req, res) => {
  try {
    const providers = AIProviderService.getProviders();
    res.json(providers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
