const express = require('express');
const { register, login, logout, getSession } = require('../controllers/authController');
const { validateAuthRequest } = require('../middleware/validateRequest');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateAuthRequest, register);
router.post('/login', validateAuthRequest, login);
router.post('/logout', logout);

// Protected routes
router.get('/session', verifyToken, getSession);

module.exports = router; 