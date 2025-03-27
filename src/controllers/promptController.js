const { enhancePrompt } = require('../services/aiService');
const logger = require('../utils/logger');

const enhancePromptController = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    logger.info(`Received prompt enhancement request`);
    
    const enhancedPrompt = await enhancePrompt(prompt);
    
    logger.info(`Successfully enhanced prompt`);
    
    res.status(200).json({
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { enhancePromptController }; 