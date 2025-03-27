const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const enhancePrompt = async (originalPrompt) => {
  try {
    // Use gemini-1.5-flash which should be available in the free tier
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert prompt engineer. Your task is to enhance user prompts to make them more effective for AI systems.
      
    Guidelines for enhancement:
    - Maintain the original intent and meaning
    - Add clarity, specificity, and structure
    - Make the prompt more effective for AI systems
    - Do not change the fundamental request or add unintended requirements
    - Format the prompt appropriately (e.g., add paragraphs, bullet points if needed)
    - Do not add any additional text or instructions
    - Keep the prompt concise and to the points
    
    Original prompt: ${originalPrompt}
    
    Enhanced prompt:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedPrompt = response.text().trim();
    
    return enhancedPrompt;
  } catch (error) {
    logger.error(`Error enhancing prompt: ${error.message}`);
    throw new Error('Failed to enhance prompt');
  }
};

module.exports = { enhancePrompt }; 