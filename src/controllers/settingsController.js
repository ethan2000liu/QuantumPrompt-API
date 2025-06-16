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

    // Get user settings with selected key details
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select(`
        *,
        selected_key:selected_key_id (
          id,
          provider,
          name
        )
      `)
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      logger.error('Settings fetch error:', settingsError);
      throw settingsError;
    }

    res.json({
      settings: {
        ...settings,
        selected_key: settings.selected_key || null
      }
    });
  } catch (error) {
    logger.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { use_own_api, selected_key_id } = req.body;

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        use_own_api,
        selected_key_id
      })
      .eq('user_id', userId)
      .select(`
        *,
        selected_key:selected_key_id (
          id,
          provider,
          name
        )
      `)
      .single();

    if (error) {
      logger.error('Settings update error:', error);
      throw error;
    }

    res.json({
      message: 'Settings updated successfully',
      settings: {
        ...data,
        selected_key: data.selected_key || null
      }
    });
  } catch (error) {
    logger.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
}; 