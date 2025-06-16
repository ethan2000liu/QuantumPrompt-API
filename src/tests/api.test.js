const request = require('supertest');
const app = require('../app');
const { supabase } = require('../config/database');

let authToken;
let userId;
let apiKeyId;

describe('API Tests', () => {
  // Clean up test data before running tests
  beforeAll(async () => {
    // Delete test user if exists
    await supabase
      .from('users')
      .delete()
      .eq('email', 'test@example.com');
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      
      // Save user ID for later tests
      userId = res.body.user.id;
    });

    test('should not register with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    test('should login successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      
      // Save auth token for later tests
      authToken = res.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    test('should get session data', async () => {
      const res = await request(app)
        .get('/api/auth/session')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('settings');
    });
  });

  describe('API Key Management', () => {
    test('should add new API key', async () => {
      const res = await request(app)
        .post('/api/api-keys')
        .set('Cookie', [`token=${authToken}`])
        .send({
          provider: 'openai',
          apiKey: 'test-api-key'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('provider', 'openai');
      
      // Save API key ID for later tests
      apiKeyId = res.body.id;
    });

    test('should get API keys', async () => {
      const res = await request(app)
        .get('/api/api-keys')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('apiKeys');
      expect(Array.isArray(res.body.apiKeys)).toBe(true);
      expect(res.body.apiKeys.length).toBeGreaterThan(0);
    });

    test('should delete API key', async () => {
      const res = await request(app)
        .delete(`/api/api-keys/${apiKeyId}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'API key deleted successfully');
    });
  });

  describe('Settings Management', () => {
    test('should get user settings', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('settings');
      expect(res.body.settings).toHaveProperty('preferred_model');
      expect(res.body.settings).toHaveProperty('use_own_api');
    });

    test('should update user settings', async () => {
      const res = await request(app)
        .put('/api/settings')
        .set('Cookie', [`token=${authToken}`])
        .send({
          useOwnApi: true
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('settings');
      expect(res.body.settings).toHaveProperty('use_own_api', true);
    });
  });

  describe('Prompt Enhancement', () => {
    test('should enhance prompt', async () => {
      const res = await request(app)
        .post('/api/prompt/enhance')
        .set('Cookie', [`token=${authToken}`])
        .send({
          prompt: 'Test prompt'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('originalPrompt');
      expect(res.body).toHaveProperty('enhancedPrompt');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid token', async () => {
      const res = await request(app)
        .get('/api/settings')
        .set('Cookie', ['token=invalid-token']);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('should handle rate limiting', async () => {
      // Make multiple requests quickly to trigger rate limit
      const requests = Array(101).fill().map(() => 
        request(app)
          .get('/api/settings')
          .set('Cookie', [`token=${authToken}`])
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponse = responses.find(res => res.status === 429);
      
      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.body).toHaveProperty('error', 'Too many requests, please try again later.');
    });
  });

  // Clean up after tests
  afterAll(async () => {
    // Delete test user and all related data
    await supabase
      .from('users')
      .delete()
      .eq('email', 'test@example.com');
  });
}); 