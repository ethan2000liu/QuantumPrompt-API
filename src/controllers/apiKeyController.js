const CryptoJS = require('crypto-js');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');

const encryptApiKey = (apiKey) => {
  return CryptoJS.AES.encrypt(apiKey, process.env.ENCRYPTION_KEY).toString();
};

const decryptApiKey = (encryptedApiKey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, process.env.ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const addApiKey = async (req, res) => {
  try {
    const { provider, apiKey } = req.body;
    const userId = req.user.id;

    logger.info('Adding API key:', { provider, userId });

    // Encrypt API key
    const encryptedApiKey = encryptApiKey(apiKey);

    // Store in database
    const { data, error } = await supabase
      .from('api_keys')
      .insert([
        {
          user_id: userId,
          provider,
          api_key: encryptedApiKey
        }
      ])
      .select()
      .single();

    if (error) {
      logger.error('Supabase insert error:', error);
      throw error;
    }

    res.status(201).json({
      message: 'API key added successfully',
      id: data.id,
      provider: data.provider
    });
  } catch (error) {
    logger.error('Add API key error:', error);
    res.status(500).json({ 
      error: 'Failed to add API key',
      details: error.message || error
    });
  }
};

const getApiKeys = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('api_keys')
      .select('id, provider, created_at')
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      apiKeys: data
    });
  } catch (error) {
    logger.error('Get API keys error:', error.message);
    res.status(500).json({ error: 'Failed to get API keys' });
  }
};

const deleteApiKey = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({
      message: 'API key deleted successfully'
    });
  } catch (error) {
    logger.error('Delete API key error:', error.message);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
};

module.exports = {
  addApiKey,
  getApiKeys,
  deleteApiKey,
  encryptApiKey,
  decryptApiKey
}; 