
-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    banned_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_until ON banned_users(banned_until);
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_at ON banned_users(banned_at);
