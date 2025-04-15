const express = require('express');
const router = express.Router();
const AIProviderService = require('../services/AIProviderService');

router.get('/', (req, res) => {
  try {
    const providers = AIProviderService.getProviders();
    res.json(providers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
