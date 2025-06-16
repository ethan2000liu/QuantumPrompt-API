const { GoogleGenerativeAI } = require('@google/generative-ai');
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
    const { apiKey = process.env.GOOGLE_API_KEY } = options;
    const model = 'gemini-1.5-flash';

    logger.info('Enhancing prompt with:', { model });

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model });
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const enhancedPrompt = response.text().trim();
    
    return enhancedPrompt;
  } catch (error) {
    logger.error('Error enhancing prompt:', error);
    throw new AIError('Failed to enhance prompt', error);
  }
};

module.exports = { enhancePrompt }; 