-- Add selected_key_id column to user_settings
ALTER TABLE user_settings
ADD COLUMN selected_key_id UUID REFERENCES api_keys(id);

-- Update existing rows to use the most recent API key if available
UPDATE user_settings us
SET selected_key_id = (
    SELECT id 
    FROM api_keys ak 
    WHERE ak.user_id = us.user_id 
    ORDER BY created_at DESC 
    LIMIT 1
)
WHERE EXISTS (
    SELECT 1 
    FROM api_keys ak 
    WHERE ak.user_id = us.user_id
); 