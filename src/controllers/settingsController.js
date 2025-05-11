const { supabase } = require('../config/database');
const logger = require('../utils/logger');

class SettingsError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'SettingsError';
    this.details = details;
  }
}

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info('Fetching settings for user:', { userId });

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select(`
        *,
        selected_key:selected_key_id (
          id,
          provider,
          created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Error fetching settings:', error);
      throw new SettingsError('Failed to fetch settings', error);
    }

    if (!settings) {
      throw new SettingsError('Settings not found');
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error in getSettings:', error);
    
    if (error instanceof SettingsError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get settings'
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { useOwnApi, selectedKeyId } = req.body;

    logger.info('Updating settings for user:', { userId, useOwnApi, selectedKeyId });

    // If selecting a specific key, verify it belongs to the user
    if (selectedKeyId) {
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('id')
        .eq('id', selectedKeyId)
        .eq('user_id', userId)
        .single();

      if (keyError || !keyData) {
        throw new SettingsError('Invalid API key selected');
      }
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update({
        use_own_api: useOwnApi,
        selected_key_id: selectedKeyId
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating settings:', error);
      throw new SettingsError('Failed to update settings', error);
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('Error in updateSettings:', error);
    
    if (error instanceof SettingsError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        details: error.details
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
}; 