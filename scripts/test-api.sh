#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

# Function to print section headers
print_section() {
    echo -e "\n${GREEN}=== $1 ===${NC}\n"
}

# Function to make API calls and print results
make_request() {
    echo "Request: $1"
    echo "Response:"
    eval $1
    echo -e "\n"
}

# Test Authentication
print_section "Testing Authentication"

# Register
make_request "curl -X POST $BASE_URL/api/auth/register \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"

# Login
make_request "curl -X POST $BASE_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'"

# Save token from login response
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@example.com","password":"password123"}' | jq -r '.token')

# Test API Key Management
print_section "Testing API Key Management"

# Add API key
make_request "curl -X POST $BASE_URL/api/api-keys \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer $TOKEN' \
    -d '{\"provider\":\"openai\",\"apiKey\":\"test-api-key\"}'"

# Get API keys
make_request "curl -X GET $BASE_URL/api/api-keys \
    -H 'Authorization: Bearer $TOKEN'"

# Test Settings Management
print_section "Testing Settings Management"

# Get settings
make_request "curl -X GET $BASE_URL/api/settings \
    -H 'Authorization: Bearer $TOKEN'"

# Update settings
make_request "curl -X PUT $BASE_URL/api/settings \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer $TOKEN' \
    -d '{\"preferredModel\":\"gpt-4\",\"useOwnApi\":true}'"

# Test Prompt Enhancement
print_section "Testing Prompt Enhancement"

# Enhance prompt
make_request "curl -X POST $BASE_URL/api/prompt/enhance \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer $TOKEN' \
    -d '{\"prompt\":\"Test prompt\"}'"

# Test Error Handling
print_section "Testing Error Handling"

# Test invalid token
make_request "curl -X GET $BASE_URL/api/settings \
    -H 'Authorization: Bearer invalid-token'"

# Test rate limiting
print_section "Testing Rate Limiting"
echo "Making multiple requests to trigger rate limit..."

for i in {1..101}; do
    curl -s -X GET $BASE_URL/api/settings \
        -H 'Authorization: Bearer $TOKEN' > /dev/null &
done

wait

# Final request to check rate limit
make_request "curl -X GET $BASE_URL/api/settings \
    -H 'Authorization: Bearer $TOKEN'"

print_section "Testing Complete" 