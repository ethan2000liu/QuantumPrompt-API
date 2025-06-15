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
    const { use_own_api, selected_key_id } = req.body;

    logger.info('Updating settings for user:', { userId, use_own_api, selected_key_id });

    // If selecting a specific key, verify it belongs to the user
    if (selected_key_id) {
      const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('id')
        .eq('id', selected_key_id)
        .eq('user_id', userId)
        .single();

      if (keyError || !keyData) {
        throw new SettingsError('Invalid API key selected');
      }
    }

    // First try to update
    const { data: settings, error: updateError } = await supabase
      .from('user_settings')
      .update({
        use_own_api,
        selected_key_id
      })
      .eq('user_id', userId)
      .select()
      .single();

    // If no rows were updated, create new settings
    if (updateError && updateError.code === 'PGRST116') {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          use_own_api,
          selected_key_id,
          preferred_model: 'gemini-1.5-flash'
        }])
        .select()
        .single();

      if (insertError) {
        logger.error('Error creating settings:', insertError);
        throw new SettingsError('Failed to create settings', insertError);
      }

      return res.json({
        success: true,
        data: newSettings
      });
    }

    if (updateError) {
      logger.error('Error updating settings:', updateError);
      throw new SettingsError('Failed to update settings', updateError);
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