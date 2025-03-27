const dotenv = require('dotenv');
const path = require('path');

// Configure dotenv with explicit path to .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Add debug log

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const promptRoutes = require('./routes/promptRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(cors({
  origin: ['chrome-extension://*', 'https://chat.openai.com', 'https://gemini.google.com'],
  methods: ['POST'],
}));

// Add this after your middleware setup but before your routes
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', promptRoutes);

// Add this after your API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app; 