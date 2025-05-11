-- Drop the table if it exists
DROP TABLE IF EXISTS api_keys;

-- Recreate the api_keys table
CREATE TABLE api_keys (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy that allows all operations
CREATE POLICY "Allow all operations on api_keys" ON api_keys
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id); 