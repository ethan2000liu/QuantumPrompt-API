const { RateLimiterMemory } = require('rate-limiter-flexible');
const logger = require('../utils/logger');

const rateLimiter = new RateLimiterMemory({
  points: 5, // Number of requests
  duration: 60, // Per minute
});

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    // Use IP as key for rate limiting
    const key = req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (err) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later',
    });
  }
};

module.exports = rateLimiterMiddleware; 