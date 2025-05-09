const { z } = require('zod');

const authSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const promptSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty')
});

const apiKeySchema = z.object({
  provider: z.enum(['openai', 'google']),
  apiKey: z.string().min(1, 'API key cannot be empty')
});

const settingsSchema = z.object({
  preferredModel: z.enum(['gpt-4', 'gpt-3.5-turbo', 'gemini-1.5-flash']),
  useOwnApi: z.boolean()
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
  try {
    apiKeySchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
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