const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const Bucket = require('../models/Bucket');
const Squad = require('../models/Squad');

// @route   GET /api/requirements
// @desc    Get all requirements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const requirements = await Requirement.find()
      .populate('bucket')
      .populate('squad')
      .sort({ priority: 1 });
    
    res.json(requirements);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/requirements
// @desc    Create a new requirement
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      bucket,
      squad,
      metrics
    } = req.body;
    
    // Create new requirement
    const requirement = new Requirement({
      title,
      description,
      bucket,
      squad,
      metrics
    });
    
    // Save requirement
    await requirement.save();
    
    // Get all requirements to recalculate priorities
    const requirements = await Requirement.find().sort({ 'metrics.roi': -1 });
    
    // Update priorities
    for (let i = 0; i < requirements.length; i++) {
      requirements[i].priority = i + 1;
      await requirements[i].save();
    }
    
    // Return the newly created requirement with populated fields
    const newRequirement = await Requirement.findById(requirement._id)
      .populate('bucket')
      .populate('squad');
    
    res.json(newRequirement);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/requirements/prioritize
// @desc    Update priorities of requirements
// @access  Public
router.put('/prioritize', async (req, res) => {
  try {
    const { requirements } = req.body;
    
    // Update each requirement's priority
    for (const req of requirements) {
      await Requirement.findByIdAndUpdate(req._id, { priority: req.priority });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/requirements/buckets
// @desc    Get all buckets
// @access  Public
router.get('/buckets', async (req, res) => {
  try {
    const buckets = await Bucket.find();
    res.json(buckets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/requirements/squads
// @desc    Get all squads
// @access  Public
router.get('/squads', async (req, res) => {
  try {
    const squads = await Squad.find();
    res.json(squads);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
