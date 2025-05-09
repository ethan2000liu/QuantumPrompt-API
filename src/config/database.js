const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_settings').select('count').limit(1);
    if (error) throw error;
    logger.info('Successfully connected to Supabase');
  } catch (error) {
    logger.error('Failed to connect to Supabase:', error.message);
    throw error;
  }
};

module.exports = {
  supabase,
  testConnection
}; 