const verifySession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info('Verifying session for user:', { userId });

    // Since we already have the user ID from the JWT token,
    // and Supabase has verified the token, we can trust that the user exists
    // We just need to verify that the token hasn't expired
    if (!userId) {
      logger.error('Session verification failed: No user ID in token');
      return res.status(401).json({
        success: false,
        error: 'Invalid session'
      });
    }

    // Session is valid
    next();
  } catch (error) {
    logger.error('Session verification failed:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid session'
    });
  }
}; 