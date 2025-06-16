const { z } = require('zod');

const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const promptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty')
});

const apiKeySchema = z.object({
  provider: z.literal('google'),
  apiKey: z.string().min(1, 'API key cannot be empty'),
  name: z.string().optional()
});

const settingsSchema = z.object({
  use_own_api: z.boolean().optional(),
  selected_key_id: z.string().uuid().nullable().optional()
});

const validateAuthRequest = (req, res, next) => {
  try {
    authSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

const validatePromptRequest = (req, res, next) => {
  try {
    promptSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

const validateApiKeyRequest = (req, res, next) => {
  const { provider, apiKey, name } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({ error: 'Provider and API key are required' });
  }

  if (provider !== 'google') {
    return res.status(400).json({ error: 'Only Google provider is supported' });
  }

  if (name && typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be a string' });
  }

  next();
};

const validateSettingsRequest = (req, res, next) => {
  try {
    settingsSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

module.exports = {
  validateAuthRequest,
  validatePromptRequest,
  validateApiKeyRequest,
  validateSettingsRequest
}; 