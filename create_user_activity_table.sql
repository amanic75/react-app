-- Create user_activity table for real-time activity tracking
-- This replaces the in-memory tracking for serverless compatibility

CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) UNIQUE NOT NULL,
    user_name VARCHAR(255),
    user_role VARCHAR(100),
    page VARCHAR(255),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_email ON user_activity(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_seen ON user_activity(last_seen);

-- Enable RLS (Row Level Security)
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage user activity" ON user_activity
    FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow authenticated users to see all activity (for admin dashboard)
CREATE POLICY "Authenticated users can view user activity" ON user_activity
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create a function to create this table (for API usage)
CREATE OR REPLACE FUNCTION create_user_activity_table()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
    -- Table creation is handled by the main SQL above
    -- This function exists for API compatibility
    SELECT 1;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION create_user_activity_table() TO service_role;
GRANT EXECUTE ON FUNCTION create_user_activity_table() TO authenticated;

-- Comments for documentation
COMMENT ON TABLE user_activity IS 'Tracks real-time user activity for serverless activity monitoring';
COMMENT ON COLUMN user_activity.user_email IS 'Primary identifier for tracking users';
COMMENT ON COLUMN user_activity.last_seen IS 'Timestamp of last activity - used for cleanup';
COMMENT ON COLUMN user_activity.page IS 'Current page the user is viewing'; 