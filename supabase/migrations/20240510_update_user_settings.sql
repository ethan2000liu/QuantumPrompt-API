-- Add new columns to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS preferred_api_provider TEXT,
ADD COLUMN IF NOT EXISTS use_own_api BOOLEAN DEFAULT false;
 
-- Update existing rows to have default values
UPDATE user_settings
SET preferred_api_provider = 'google',
    use_own_api = false
WHERE preferred_api_provider IS NULL; 