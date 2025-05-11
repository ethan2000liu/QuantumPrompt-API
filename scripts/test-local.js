const axios = require('axios');

const API_URL = 'http://localhost:3000';
let authToken = null;

async function testEndpoints() {
  try {
    console.log('🧪 Starting API Tests...\n');

    // 1. Test Health Endpoint
    console.log('1️⃣ Testing Health Endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data, '\n');

    // 2. Test Registration
    console.log('2️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    console.log('✅ Registration:', registerResponse.data, '\n');

    // 3. Test Login
    console.log('3️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword123'
    });
    authToken = loginResponse.data.token;
    console.log('✅ Login:', 'Success');
    console.log('Token received:', authToken ? 'Yes' : 'No', '\n');

    // Create axios instance with auth header
    const authAxios = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Auth header set:', authAxios.defaults.headers.Authorization ? 'Yes' : 'No', '\n');

    // 4. Test Prompt Enhancement
    console.log('4️⃣ Testing Prompt Enhancement...');
    const promptResponse = await authAxios.post('/api/prompt/enhance', {
      prompt: 'compose report for BTC today'
    });
    console.log('✅ Prompt Enhancement:', promptResponse.data, '\n');

    // 5. Test API Key Creation
    console.log('5️⃣ Testing API Key Creation...');
    const apiKeyResponse = await authAxios.post('/api/api-keys', {
      provider: 'google',
      apiKey: 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' // Example Google API key format
    });
    console.log('✅ API Key Creation:', apiKeyResponse.data, '\n');

    // 6. Test Settings
    console.log('6️⃣ Testing User Settings...');
    const settingsResponse = await authAxios.get('/api/settings');
    console.log('✅ User Settings:', settingsResponse.data, '\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test Failed:', error.response ? error.response.data : error.message);
  }
}

testEndpoints(); 