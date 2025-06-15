const { enhancePrompt } = require('../services/aiService');
const { supabase } = require('../config/database');
const { decryptApiKey } = require('../controllers/apiKeyController');
const logger = require('../utils/logger');

class PromptError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'PromptError';
    this.details = details;
  }
}

const enhancePromptController = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.user.id;

    logger.info('Enhancing prompt for user:', { userId });

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select(`
        use_own_api,
        selected_key:selected_key_id (
          id,
          provider,
          api_key
        )
      `)
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      logger.error('Error fetching user settings:', settingsError);
      throw new PromptError('Failed to fetch user settings', settingsError);
    }

    if (!settings) {
      throw new PromptError('User settings not found');
    }

    let apiKey = process.env.GOOGLE_API_KEY;
    let provider = 'google';
    let model = 'gemini-1.5-flash';

    // If user wants to use their own API
    if (settings.use_own_api) {
      if (!settings.selected_key) {
        throw new PromptError('No API key selected. Please select an API key in your settings.');
      }

      try {
        apiKey = await decryptApiKey(settings.selected_key.api_key);
        provider = settings.selected_key.provider;
      } catch (error) {
        logger.error('Error decrypting API key:', error);
        throw new PromptError('Failed to decrypt API key');
      }
    }

    logger.info('Enhancing prompt with settings:', { provider, model });

    const enhancedPrompt = await enhancePrompt(prompt, {
      provider,
      apiKey,
      model
    });
    
    res.json({
      success: true,
      data: {
      originalPrompt: prompt,
        enhancedPrompt
      }
    });
  } catch (error) {
    logger.error('Error in enhancePromptController:', error);
    
    if (error instanceof PromptError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to enhance prompt',
      details: error.message
    });
  }
};

module.exports = {
  enhancePromptController
}; 