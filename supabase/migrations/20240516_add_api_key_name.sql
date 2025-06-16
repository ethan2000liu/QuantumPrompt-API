-- Add name column to api_keys table
ALTER TABLE api_keys
ADD COLUMN name TEXT NOT NULL DEFAULT 'My API Key';

-- Update existing rows to have a default name
UPDATE api_keys
SET name = CONCAT('API Key ', id::text)
WHERE name = 'My API Key'; 