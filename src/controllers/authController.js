const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/database');
const logger = require('../utils/logger');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate backup codes
const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Auth error handler
const handleAuthError = (error) => {
  logger.error('Auth error:', error);

  // Handle specific Supabase Auth errors
  if (error.__isAuthError) {
    switch (error.code) {
      case 'email_address_invalid':
        return { status: 400, message: 'Please provide a valid email address' };
      case 'user_already_exists':
        return { status: 400, message: 'An account with this email already exists' };
      case 'invalid_credentials':
        return { status: 401, message: 'Invalid email or password' };
      case 'email_not_confirmed':
        return { status: 403, message: 'Please verify your email address' };
      case 'invalid_refresh_token':
        return { status: 401, message: 'Invalid or expired session' };
      case 'weak_password':
        return { status: 400, message: 'Password is too weak. Please use a stronger password' };
      case 'rate_limit_exceeded':
        return { status: 429, message: 'Too many attempts. Please try again later' };
      default:
        return { status: 400, message: error.message || 'Authentication error' };
    }
  }

  // Handle other errors
  return { status: 500, message: 'An unexpected error occurred' };
};

// Setup 2FA
const setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `QuantumPrompt:${req.user.email}`
    });

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store secret and backup codes
    const { error } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret.base32,
        backup_codes: backupCodes
      })
      .eq('id', userId);

    if (error) throw error;

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      secret: secret.base32,
      qrCode,
      backupCodes
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({ error: 'Failed to setup 2FA' });
  }
};

// Verify and enable 2FA
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    // Get user's secret
    const { data: user, error } = await supabase
      .from('users')
      .select('two_factor_secret')
      .eq('id', userId)
      .single();

    if (error || !user) throw new Error('User not found');

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }

    // Enable 2FA
    await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', userId);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    logger.error('2FA verification error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
};

// Verify 2FA token during login
const verify2FAToken = async (userId, token) => {
  const { data: user } = await supabase
    .from('users')
    .select('two_factor_secret, backup_codes')
    .eq('id', userId)
    .single();

  if (!user) return false;

  // Check if it's a backup code
  if (user.backup_codes.includes(token)) {
    // Remove used backup code
    await supabase
      .from('users')
      .update({
        backup_codes: user.backup_codes.filter(code => code !== token)
      })
      .eq('id', userId);
    return true;
  }

  // Verify TOTP token
  return speakeasy.totp.verify({
    secret: user.two_factor_secret,
    encoding: 'base32',
    token
  });
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL}/reset-password`
    });

    if (error) {
      logger.error('Password reset request error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      logger.error('Password reset error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// Update register function to include email verification
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Register with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.APP_URL}/auth/callback`
      }
    });

    if (authError) {
      logger.error('Registration error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Create default user settings
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert([
        { 
          user_id: authData.user.id,
          use_own_api: false
        }
      ]);

    if (settingsError) {
      logger.error('Settings creation error:', settingsError);
      // Don't return error here, as user is already created
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
};

// Verify email endpoint
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Find valid verification token
    const { data: verificationToken } = await supabase
      .from('email_verification_tokens')
      .select('user_id')
      .eq('token', token)
      .gt('expires_at', new Date())
      .single();

    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user's email verification status
    await supabase
      .from('users')
      .update({ 
        email_verified: true,
        verification_token: null
      })
      .eq('id', verificationToken.user_id);

    // Delete used token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Store new token
    await supabase
      .from('email_verification_tokens')
      .insert({
        user_id: user.id,
        token: verificationToken,
        expires_at: expiresAt
      });

    // Update user's verification token
    await supabase
      .from('users')
      .update({ verification_token: verificationToken })
      .eq('id', user.id);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    logger.error('Resend verification email error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
};

// Update login to check email verification
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      logger.error('Login error:', authError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      token: authData.session.access_token
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};

const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

const getSession = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      logger.error('Session error:', userError);
      return res.status(401).json({ error: 'No active session' });
    }

    // Get user settings
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError) {
      logger.error('Settings fetch error:', settingsError);
      throw settingsError;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      settings
    });
  } catch (error) {
    logger.error('Session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getSession,
  setup2FA,
  verify2FA,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail
}; 