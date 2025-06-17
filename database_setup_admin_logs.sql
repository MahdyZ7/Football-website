
-- Add this to your database setup
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_user VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_user VARCHAR(100),
    target_name VARCHAR(200),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_user ON admin_logs(admin_user);
