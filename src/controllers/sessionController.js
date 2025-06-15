const getSession = async (req, res) => {
  try {
    const userId = req.user.id;
    logger.info('Getting session for user:', { userId });

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError && settingsError.code !== 'PGRST116') {
      logger.error('Settings fetch error:', settingsError);
      throw new Error('Failed to fetch settings');
    }

    // If no settings exist, create default settings
    if (!settings) {
      const { data: newSettings, error: insertError } = await supabase
        .from('user_settings')
        .insert([{
          user_id: userId,
          use_own_api: false,
          selected_key_id: null,
          preferred_model: 'gemini-1.5-flash'
        }])
        .select()
        .single();

      if (insertError) {
        logger.error('Error creating default settings:', insertError);
        throw new Error('Failed to create default settings');
      }

      return res.json({
        success: true,
        data: {
          user: {
            id: userId
          },
          settings: newSettings
        }
      });
    }

    // Get user's API keys if they exist
    const { data: apiKeys, error: apiKeysError } = await supabase
      .from('api_keys')
      .select('id, provider, created_at')
      .eq('user_id', userId);

    if (apiKeysError) {
      logger.error('API keys fetch error:', apiKeysError);
      throw new Error('Failed to fetch API keys');
    }

    res.json({
      success: true,
      data: {
        user: {
          id: userId
        },
        settings,
        apiKeys: apiKeys || []
      }
    });
  } catch (error) {
    logger.error('Session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session'
    });
  }
}; 