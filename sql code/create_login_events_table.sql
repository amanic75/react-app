-- Create login_events table for tracking user authentication events
-- This replaces localStorage-based tracking with persistent database storage

-- Create the login_events table
CREATE TABLE IF NOT EXISTS login_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_login_events_user_email ON login_events(user_email);
CREATE INDEX IF NOT EXISTS idx_login_events_created_at ON login_events(created_at);
CREATE INDEX IF NOT EXISTS idx_login_events_event_type ON login_events(event_type);
CREATE INDEX IF NOT EXISTS idx_login_events_user_email_created_at ON login_events(user_email, created_at);

-- Enable Row Level Security
ALTER TABLE login_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy 1: Users can view their own login events
CREATE POLICY "Users can view own login events" ON login_events
    FOR SELECT
    USING (
        user_email = auth.email()
    );

-- Policy 2: Admins can view all login events
CREATE POLICY "Admins can view all login events" ON login_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE email = auth.email() 
            AND role = 'Capacity Admin'
        )
    );

-- Policy 3: Service role can insert login events (for API endpoints)
CREATE POLICY "Service role can insert login events" ON login_events
    FOR INSERT
    WITH CHECK (true);

-- Policy 4: Service role can select all login events (for metrics)
CREATE POLICY "Service role can select all login events" ON login_events
    FOR SELECT
    USING (true);

-- Add some helpful comments
COMMENT ON TABLE login_events IS 'Stores user authentication events (login/logout) for activity tracking and analytics';
COMMENT ON COLUMN login_events.event_type IS 'Type of authentication event: login or logout';
COMMENT ON COLUMN login_events.session_id IS 'Unique session identifier for tracking user sessions';
COMMENT ON COLUMN login_events.ip_address IS 'IP address of the user for security monitoring';
COMMENT ON COLUMN login_events.user_agent IS 'Browser/client user agent string';

-- Create a function to clean up old login events (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_login_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_events 
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_login_events(INTEGER) IS 'Cleans up login events older than specified days (default 90 days)';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON login_events TO authenticated;

-- Test the table creation
INSERT INTO login_events (user_email, user_name, user_role, event_type, session_id) 
VALUES ('test@example.com', 'Test User', 'Employee', 'login', 'test-session-123');

-- Clean up test data
DELETE FROM login_events WHERE user_email = 'test@example.com';

-- Display table info
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'login_events' 
ORDER BY ordinal_position; 