-- NextAuth.js v5 Database Schema for PostgreSQL
-- This creates the required tables for NextAuth with additional custom fields

-- Users table: Core user information consolidated across OAuth providers
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  email_verified TIMESTAMP WITH TIME ZONE,
  image TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table: OAuth provider accounts linked to users
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, provider_account_id)
);

-- Sessions table: User sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification tokens table: Email verification
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON sessions(session_token);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Update players table to link with auth users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'players' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE players ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS players_user_id_idx ON players(user_id);

-- Update banned_users table to link with auth users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'banned_users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE banned_users ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS banned_users_user_id_idx ON banned_users(user_id);

-- Update admin_logs to track which user performed the action
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_logs' AND column_name = 'performed_by_user_id'
  ) THEN
    ALTER TABLE admin_logs ADD COLUMN performed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS admin_logs_performed_by_idx ON admin_logs(performed_by_user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
