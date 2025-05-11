const express = require('express');
const { enhancePromptController } = require('../controllers/promptController');
const { validatePromptRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');
const rateLimiterMiddleware = require('../middleware/rateLimiter');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.post('/enhance', 
  rateLimiterMiddleware,
  validatePromptRequest,
  enhancePromptController
);

module.exports = router; 