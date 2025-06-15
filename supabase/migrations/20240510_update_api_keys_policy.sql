-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert their own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their own API keys" ON api_keys;
 
-- Create new policies that don't rely on auth.uid()
CREATE POLICY "Allow all operations on api_keys" ON api_keys
    FOR ALL
    USING (true)
    WITH CHECK (true); 