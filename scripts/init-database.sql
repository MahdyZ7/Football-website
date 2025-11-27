-- ============================================================================
-- Football League Database Initialization Script
-- ============================================================================
-- This script creates all required tables for the football registration system
-- Run this script to initialize a fresh database
-- ============================================================================

-- Enable UUID extension for random ID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- AUTHENTICATION TABLES (NextAuth.js v5)
-- ============================================================================

-- Users table: Core user information consolidated across OAuth providers
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  role VARCHAR(50) DEFAULT 'user',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table: OAuth provider accounts linked to users
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, "providerAccountId")
);

-- Sessions table: User sessions
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification tokens table: Email verification
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- ============================================================================
-- FOOTBALL REGISTRATION TABLES
-- ============================================================================

-- Players table: User registrations for football matches
CREATE TABLE IF NOT EXISTS players (
  name VARCHAR(255),
  intra VARCHAR(255) PRIMARY KEY,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Money table: Payment tracking
CREATE TABLE IF NOT EXISTS money (
  date DATE,
  name VARCHAR(255),
  intra VARCHAR(255),
  amount INTEGER,
  paid BOOLEAN
);

-- Expenses table: Expense management
CREATE TABLE IF NOT EXISTS expenses (
  name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  invoice_id VARCHAR(255) NOT NULL,
  PRIMARY KEY (name, date)
);

-- Inventory table: Inventory management
CREATE TABLE IF NOT EXISTS inventory (
  name VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL
);

-- ============================================================================
-- ADMIN & MODERATION TABLES
-- ============================================================================

-- Banned users table: User ban system
CREATE TABLE IF NOT EXISTS banned_users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- Admin logs table: Admin action logging with full audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
  id SERIAL PRIMARY KEY,
  admin_user VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_user VARCHAR(100),
  target_name VARCHAR(200),
  details TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  performed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- FEEDBACK SYSTEM TABLES
-- ============================================================================

-- Feedback submissions table: Feature requests, bug reports, and user feedback
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('feature', 'bug', 'feedback')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
  is_approved BOOLEAN DEFAULT FALSE,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback votes table: User votes on approved feedback
CREATE TABLE IF NOT EXISTS feedback_votes (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Authentication indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts("userId");
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions("userId");
CREATE INDEX IF NOT EXISTS sessions_session_token_idx ON sessions("sessionToken");

-- Football registration indexes
CREATE INDEX IF NOT EXISTS players_user_id_idx ON players(user_id);
CREATE INDEX IF NOT EXISTS players_created_at_idx ON players(created_at DESC);

-- Admin & moderation indexes
CREATE INDEX IF NOT EXISTS banned_users_user_id_idx ON banned_users(user_id);
CREATE INDEX IF NOT EXISTS banned_users_banned_until_idx ON banned_users(banned_until);
CREATE INDEX IF NOT EXISTS banned_users_banned_at_idx ON banned_users(banned_at);
CREATE INDEX IF NOT EXISTS admin_logs_performed_by_idx ON admin_logs(performed_by_user_id);
CREATE INDEX IF NOT EXISTS admin_logs_timestamp_idx ON admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS admin_logs_admin_user_idx ON admin_logs(admin_user);

-- Feedback system indexes
CREATE INDEX IF NOT EXISTS feedback_submissions_user_id_idx ON feedback_submissions(user_id);
CREATE INDEX IF NOT EXISTS feedback_submissions_status_idx ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS feedback_submissions_type_idx ON feedback_submissions(type);
CREATE INDEX IF NOT EXISTS feedback_submissions_is_approved_idx ON feedback_submissions(is_approved);
CREATE INDEX IF NOT EXISTS feedback_votes_feedback_id_idx ON feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS feedback_votes_user_id_idx ON feedback_votes(user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updatedAt for auth tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update feedback updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_feedback_submissions_updated_at ON feedback_submissions;
CREATE TRIGGER update_feedback_submissions_updated_at BEFORE UPDATE ON feedback_submissions
  FOR EACH ROW EXECUTE FUNCTION update_feedback_updated_at();

-- Function to sync vote counts with feedback_votes table
CREATE OR REPLACE FUNCTION sync_feedback_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update upvotes and downvotes for the affected feedback
    UPDATE feedback_submissions
    SET
        upvotes = (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id) AND vote_type = 'upvote'),
        downvotes = (SELECT COUNT(*) FROM feedback_votes WHERE feedback_id = COALESCE(NEW.feedback_id, OLD.feedback_id) AND vote_type = 'downvote')
    WHERE id = COALESCE(NEW.feedback_id, OLD.feedback_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS sync_feedback_votes_insert ON feedback_votes;
CREATE TRIGGER sync_feedback_votes_insert AFTER INSERT ON feedback_votes
  FOR EACH ROW EXECUTE FUNCTION sync_feedback_vote_counts();

DROP TRIGGER IF EXISTS sync_feedback_votes_update ON feedback_votes;
CREATE TRIGGER sync_feedback_votes_update AFTER UPDATE ON feedback_votes
  FOR EACH ROW EXECUTE FUNCTION sync_feedback_vote_counts();

DROP TRIGGER IF EXISTS sync_feedback_votes_delete ON feedback_votes;
CREATE TRIGGER sync_feedback_votes_delete AFTER DELETE ON feedback_votes
  FOR EACH ROW EXECUTE FUNCTION sync_feedback_vote_counts();

-- ============================================================================
-- INITIALIZATION COMPLETE
-- ============================================================================
