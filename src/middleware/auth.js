const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    logger.info('Auth token:', { token: token ? 'present' : 'missing' });

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verify with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      logger.error('Settings fetch error:', settingsError);
      // Don't return error here, as user is still valid
    }

    req.user = {
      id: user.id,
      email: user.email,
      settings: settings || null
    };
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
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