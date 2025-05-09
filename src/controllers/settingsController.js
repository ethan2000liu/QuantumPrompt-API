const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.json({
      settings: data
    });
  } catch (error) {
    logger.error('Get settings error:', error.message);
    res.status(500).json({ error: 'Failed to get settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferredModel, useOwnApi } = req.body;

    const { data, error } = await supabase
      .from('user_settings')
      .update({
        preferred_model: preferredModel,
        use_own_api: useOwnApi,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Settings updated successfully',
      settings: data
    });
  } catch (error) {
    logger.error('Update settings error:', error.message);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
}; 