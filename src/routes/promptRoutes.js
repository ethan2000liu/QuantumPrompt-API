const express = require('express');
const { enhancePromptController } = require('../controllers/promptController');
const { validatePromptRequest } = require('../middleware/validateRequest');
const rateLimiterMiddleware = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/enhance', 
  rateLimiterMiddleware,
  validatePromptRequest,
  enhancePromptController
);

module.exports = router; 