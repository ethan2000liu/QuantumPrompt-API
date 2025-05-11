const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');
const logger = require('../utils/logger');

class AIError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'AIError';
    this.details = details;
  }
}

const enhancePrompt = async (originalPrompt, options = {}) => {
  try {
    const { provider = 'google', apiKey = process.env.GOOGLE_API_KEY, model = 'gemini-1.5-flash' } = options;

    logger.info('Enhancing prompt with:', { provider, model });

    const prompt = `You are an expert prompt engineer. Your task is to enhance user prompts to make them more effective for AI systems.
      
    Guidelines for enhancement:
    - Maintain the original intent and meaning
    - Add clarity, specificity, and structure
    - Make the prompt more effective for AI systems
    - Do not change the fundamental request or add unintended requirements
    - Format the enhanced prompt in a clean, readable way
    - Do not add any additional text or instructions
    - Keep the prompt concise and to the points
    - Maintain the original language and terminology used by the user
    
    Original prompt: ${originalPrompt}
    
    Enhanced prompt:`;

    let enhancedPrompt;

    if (provider === 'google') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const geminiModel = genAI.getGenerativeModel({ model });
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      enhancedPrompt = response.text().trim();
    } else if (provider === 'openai') {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });
      enhancedPrompt = completion.choices[0].message.content.trim();
    } else {
      throw new AIError('Unsupported provider', { provider });
    }
    
    return enhancedPrompt;
  } catch (error) {
    logger.error('Error enhancing prompt:', error);
    if (error instanceof AIError) {
      throw error;
    }
    // Handle provider-specific errors
    if (error.response?.data) {
      throw new AIError('Provider API error', error.response.data);
    }
    throw new AIError('Failed to enhance prompt', error.message);
  }
};

module.exports = { enhancePrompt }; 