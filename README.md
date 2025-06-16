# QuantumPrompt API

A powerful API for enhancing prompts using Google's Gemini AI model. This API allows you to improve your prompts using state-of-the-art AI technology.

## Features

- 🔄 Prompt Enhancement: Transform basic prompts into detailed, well-structured ones using Gemini AI
- 🔑 API Key Management: Support for Google API keys
- ⚙️ Custom Settings: Configure your API key preferences
- 📊 Usage Tracking: Monitor your API usage with detailed statistics
- 🔒 Secure Authentication: JWT-based authentication system

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Supabase account
- Google API key for Gemini

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/quantumprompt-api.git
cd quantumprompt-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
GOOGLE_API_KEY=your_google_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Run database migrations:
```bash
npm run migrate
```

5. Start the server:
```bash
npm start
```

## API Documentation

### Authentication

All API endpoints require authentication using a JWT token. Include the token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### Enhance Prompt
```http
POST /api/enhance
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "prompt": "Write a blog post about quantum computing"
}
```

#### API Key Management

1. Get All API Keys:
```http
GET /api/api-keys
Authorization: Bearer YOUR_JWT_TOKEN
```

2. Add New API Key:
```http
POST /api/api-keys
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "provider": "google",
  "apiKey": "YOUR_GOOGLE_API_KEY"
}
```

#### Settings Management

1. Get Current Settings:
```http
GET /api/settings
Authorization: Bearer YOUR_JWT_TOKEN
```

2. Update Settings:
```http
PUT /api/settings
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "use_own_api": true,
  "selected_key_id": "YOUR_API_KEY_ID"
}
```

#### Usage Statistics

```http
GET /api/usage?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

## Prompt Enhancement Examples

### Basic Prompt
```
Write a blog post about quantum computing
```

### Enhanced Prompt
```
Write a comprehensive blog post about quantum computing, covering its principles, applications, and future implications. Include real-world examples and explain complex concepts in an accessible way. Focus on:
1. Basic principles of quantum mechanics
2. Current applications in cryptography and computing
3. Future potential in drug discovery and optimization
4. Challenges and limitations
5. Impact on various industries
```

## Development

### Running Tests
```bash
npm test
```

### Code Style
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@quantumprompt.com or open an issue in the GitHub repository.