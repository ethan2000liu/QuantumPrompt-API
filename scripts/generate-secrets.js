const crypto = require('crypto');

// Function to generate a secure random string
const generateSecret = (name) => {
    const secret = crypto.randomBytes(32).toString('hex');
    console.log(`${name}=${secret}`);
    return secret;
};

console.log('\n=== Generating Secure Secrets ===\n');

// Generate all required secrets
generateSecret('JWT_SECRET');
generateSecret('JWT_REFRESH_SECRET');
generateSecret('COOKIE_SECRET');
generateSecret('ENCRYPTION_KEY');

console.log('\n=== Add these to your .env file ===\n'); 