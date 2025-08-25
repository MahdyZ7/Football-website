-- Complete Database Setup for Football Website with NextAuth.js
-- This creates all required tables for the application

-- Create admin_list table first (referenced by triggers)
CREATE TABLE IF NOT EXISTS admin_list (
  id SERIAL PRIMARY KEY,
  admin_email VARCHAR(255) UNIQUE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by VARCHAR(255)
);

-- Insert default admin email (update this with your email)
INSERT INTO admin_list (admin_email, added_by) 
VALUES ('amahdy9@gmail.com', 'system')
ON CONFLICT (admin_email) DO NOTHING;

-- NextAuth.js Database Schema
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  role VARCHAR(50) DEFAULT 'user',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  CONSTRAINT "accounts_provider_providerAccountId_key" UNIQUE (provider, "providerAccountId")
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

-- Create verification_tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE (identifier, token)
);

-- Create banned_users table
CREATE TABLE IF NOT EXISTS banned_users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    banned_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_user VARCHAR(255),
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for role management
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  "assignedBy" INTEGER REFERENCES users(id),
  "assignedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON accounts("userId");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON sessions("userId");
CREATE INDEX IF NOT EXISTS "sessions_sessionToken_idx" ON sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_until ON banned_users(banned_until);
CREATE INDEX IF NOT EXISTS idx_banned_users_banned_at ON banned_users(banned_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON admin_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_email ON admin_logs(email);

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'accounts_userId_fkey') THEN
        ALTER TABLE accounts ADD CONSTRAINT "accounts_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_userId_fkey') THEN
        ALTER TABLE sessions ADD CONSTRAINT "sessions_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Function to automatically assign roles based on email
CREATE OR REPLACE FUNCTION assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user email is in admin_list
  IF EXISTS (SELECT 1 FROM admin_list WHERE LOWER(admin_email) = LOWER(NEW.email)) THEN
    NEW.role := 'admin';
  ELSE
    NEW.role := 'user';
  END IF;
  
  -- Update timestamp
  NEW."updatedAt" := NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign roles on user creation/update
DROP TRIGGER IF EXISTS assign_role_trigger ON users;
CREATE TRIGGER assign_role_trigger
  BEFORE INSERT OR UPDATE OF email ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_role();

-- Function to sync user_roles table with users table
CREATE OR REPLACE FUNCTION sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update role in user_roles table
  INSERT INTO user_roles ("userId", role, "assignedAt")
  VALUES (NEW.id, NEW.role, NOW())
  ON CONFLICT ("userId") 
  DO UPDATE SET 
    role = NEW.role,
    "assignedAt" = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync user_roles when users are updated
DROP TRIGGER IF EXISTS sync_user_roles_trigger ON users;
CREATE TRIGGER sync_user_roles_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_roles();

-- Cleanup function for expired sessions and verification tokens
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
  -- Delete expired sessions
  DELETE FROM sessions WHERE expires < NOW();
  
  -- Delete expired verification tokens
  DELETE FROM verification_tokens WHERE expires < NOW();
  
  -- Delete expired bans
  DELETE FROM banned_users WHERE banned_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup expired data (if pg_cron is available)
-- This is optional and depends on your PostgreSQL setup
-- SELECT cron.schedule('cleanup-expired', '0 2 * * *', 'SELECT cleanup_expired_data();');

COMMIT;
