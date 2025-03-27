const validatePromptRequest = (req, res, next) => {
  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({
      error: 'Prompt is required',
    });
  }
  
  if (typeof prompt !== 'string') {
    return res.status(400).json({
      error: 'Prompt must be a string',
    });
  }
  
  if (prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Prompt cannot be empty',
    });
  }
  
  next();
};

module.exports = { validatePromptRequest }; 