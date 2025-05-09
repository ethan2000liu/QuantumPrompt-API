const express = require('express');
const { 
  addApiKey, 
  getApiKeys, 
  deleteApiKey 
} = require('../controllers/apiKeyController');
const { validateApiKeyRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// API key management routes
router.post('/', validateApiKeyRequest, addApiKey);
router.get('/', getApiKeys);
router.delete('/:id', deleteApiKey);

module.exports = router; 