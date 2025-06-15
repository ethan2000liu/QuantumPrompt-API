const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    logger.info('Auth token:', { token: token ? 'present' : 'missing' });

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // First verify our custom JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.info('Decoded token:', { userId: decoded.userId });
    
    // Then verify with Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      logger.error('Session verification failed:', { error: sessionError });
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Verify the user ID matches
    if (session.user.id !== decoded.userId) {
      logger.error('User ID mismatch:', { 
        sessionUserId: session.user.id, 
        tokenUserId: decoded.userId 
      });
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (settingsError) {
      logger.error('Settings fetch error:', settingsError);
      // Don't return error here, as user is still valid
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      settings: settings || null
    };
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Verify user still exists
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Set new token in cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      domain: process.env.COOKIE_DOMAIN,
      maxAge: parseInt(process.env.JWT_EXPIRES_IN) * 1000
    });

    req.user = user;
    next();
  } catch (error) {
    logger.error('Token refresh error:', error.message);
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
};

module.exports = {
  verifyToken,
  refreshToken
}; 