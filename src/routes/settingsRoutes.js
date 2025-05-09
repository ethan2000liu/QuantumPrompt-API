const express = require('express');
const { 
  getSettings, 
  updateSettings 
} = require('../controllers/settingsController');
const { validateSettingsRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Settings management routes
router.get('/', getSettings);
router.put('/', validateSettingsRequest, updateSettings);

module.exports = router; 