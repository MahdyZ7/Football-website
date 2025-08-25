-- NextAuth.js Database Schema Migration
-- This creates the required tables for NextAuth.js with PostgreSQL adapter

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

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL
);

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

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  CONSTRAINT "verification_tokens_identifier_token_key" UNIQUE (identifier, token)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "accounts_userId_idx" ON accounts("userId");
CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON sessions("userId");
CREATE INDEX IF NOT EXISTS "sessions_sessionToken_idx" ON sessions("sessionToken");

-- Add foreign key constraints
ALTER TABLE accounts ADD CONSTRAINT "accounts_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE sessions ADD CONSTRAINT "sessions_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;

-- Update existing admin_list table to reference the new users table if needed
-- This allows for role-based access control integration
CREATE TABLE IF NOT EXISTS user_roles (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  "assignedBy" INTEGER REFERENCES users(id),
  "assignedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("userId")
);

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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically assign roles on user creation/update
DROP TRIGGER IF EXISTS assign_role_trigger ON users;
CREATE TRIGGER assign_role_trigger
  BEFORE INSERT OR UPDATE OF email ON users
  FOR EACH ROW
  EXECUTE FUNCTION assign_user_role();