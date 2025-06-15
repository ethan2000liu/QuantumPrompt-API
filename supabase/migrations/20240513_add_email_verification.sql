-- Add email verification fields to users table
ALTER TABLE users
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN verification_token TEXT;

-- Create table for email verification tokens
CREATE TABLE email_verification_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Enable RLS
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own verification tokens" ON email_verification_tokens
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own verification tokens" ON email_verification_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own verification tokens" ON email_verification_tokens
    FOR DELETE USING (auth.uid() = user_id); 