#!/usr/bin/env node

/**
 * Test Database Setup Script
 * Creates and initializes the test database with schema
 * Run before tests: npm run test:db:setup
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is required for test database setup.');
}

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: false
});

async function setupTestDatabase() {
  console.log('🧪 Setting up test database...');
  const client = await pool.connect();

  try {
    // Drop all tables (clean slate)
    console.log('  → Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS feedback_votes CASCADE;
      DROP TABLE IF EXISTS feedback_submissions CASCADE;
      DROP TABLE IF EXISTS player_rating_history CASCADE;
      DROP TABLE IF EXISTS team_generation_history CASCADE;
      DROP TABLE IF EXISTS player_reliability_events CASCADE;
      DROP TABLE IF EXISTS notification_outbox CASCADE;
      DROP TABLE IF EXISTS admin_logs CASCADE;
      DROP TABLE IF EXISTS banned_users CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
      DROP TABLE IF EXISTS expenses CASCADE;
      DROP TABLE IF EXISTS money CASCADE;
      DROP TABLE IF EXISTS players CASCADE;
      DROP TABLE IF EXISTS verification_tokens CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // Create users table (NextAuth)
    console.log('  → Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        "emailVerified" TIMESTAMP WITH TIME ZONE,
        image TEXT,
        role VARCHAR(50) DEFAULT 'user',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create accounts table (NextAuth)
    console.log('  → Creating accounts table...');
    await client.query(`
      CREATE TABLE accounts (
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
      )
    `);

    // Create sessions table (NextAuth)
    console.log('  → Creating sessions table...');
    await client.query(`
      CREATE TABLE sessions (
        id SERIAL PRIMARY KEY,
        "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
        "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create verification_tokens table (NextAuth)
    console.log('  → Creating verification_tokens table...');
    await client.query(`
      CREATE TABLE verification_tokens (
        identifier VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires TIMESTAMP WITH TIME ZONE NOT NULL,
        PRIMARY KEY (identifier, token)
      )
    `);

    // Create players table
    console.log('  → Creating players table...');
    await client.query(`
      CREATE TABLE players (
        name VARCHAR(255) NOT NULL CHECK (name <> ''),
        intra VARCHAR(255) PRIMARY KEY CHECK (intra <> ''),
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        is_banned BOOLEAN DEFAULT FALSE,
        registration_status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (registration_status IN ('confirmed', 'waitlisted')),
        waitlist_position INTEGER,
        promoted_at TIMESTAMP WITH TIME ZONE,
        last_notified_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create money table
    console.log('  → Creating money table...');
    await client.query(`
      CREATE TABLE money (
        id SERIAL PRIMARY KEY,
        date DATE,
        name VARCHAR(255),
        intra VARCHAR(255),
        amount INTEGER,
        paid BOOLEAN,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create expenses table
    console.log('  → Creating expenses table...');
    await client.query(`
      CREATE TABLE expenses (
        name VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        date DATE NOT NULL,
        invoice_id VARCHAR(255) NOT NULL,
        PRIMARY KEY (name, date)
      )
    `);

    // Create inventory table
    console.log('  → Creating inventory table...');
    await client.query(`
      CREATE TABLE inventory (
        name VARCHAR(255) NOT NULL PRIMARY KEY,
        amount INTEGER NOT NULL
      )
    `);

    // Create banned_users table
    console.log('  → Creating banned_users table...');
    await client.query(`
      CREATE TABLE banned_users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        reason TEXT NOT NULL,
        banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        banned_until TIMESTAMP WITH TIME ZONE NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create indexes for banned_users
    await client.query(`
      CREATE INDEX idx_banned_users_banned_until ON banned_users(banned_until);
      CREATE INDEX idx_banned_users_banned_at ON banned_users(banned_at);
    `);

    // Create admin_logs table
    console.log('  → Creating admin_logs table...');
    await client.query(`
      CREATE TABLE admin_logs (
        id SERIAL PRIMARY KEY,
        admin_user VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_user VARCHAR(100),
        target_name VARCHAR(200),
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        performed_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create indexes for admin_logs
    await client.query(`
      CREATE INDEX idx_admin_logs_timestamp ON admin_logs(timestamp DESC);
      CREATE INDEX idx_admin_logs_admin_user ON admin_logs(admin_user);
    `);

    console.log('  → Creating player_reliability_events table...');
    await client.query(`
      CREATE TABLE player_reliability_events (
        id SERIAL PRIMARY KEY,
        intra VARCHAR(255) NOT NULL,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(50) NOT NULL,
        reason TEXT,
        related_ban_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('  → Creating team_generation_history table...');
    await client.query(`
      CREATE TABLE team_generation_history (
        id SERIAL PRIMARY KEY,
        created_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        source VARCHAR(50) NOT NULL DEFAULT 'auto_balance',
        team_mode INTEGER NOT NULL CHECK (team_mode IN (2, 3)),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('  → Creating player_rating_history table...');
    await client.query(`
      CREATE TABLE player_rating_history (
        id SERIAL PRIMARY KEY,
        team_generation_id INTEGER NOT NULL REFERENCES team_generation_history(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        intra VARCHAR(255) NOT NULL,
        player_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        assigned_team VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    console.log('  → Creating notification_outbox table...');
    await client.query(`
      CREATE TABLE notification_outbox (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        recipient_email VARCHAR(255),
        recipient_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        subject VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
        provider_message_id TEXT,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        sent_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create feedback_submissions table
    console.log('  → Creating feedback_submissions table...');
    await client.query(`
      CREATE TABLE feedback_submissions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bug', 'feedback')),
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed')),
        is_approved BOOLEAN DEFAULT FALSE,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        approved_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create feedback_votes table
    console.log('  → Creating feedback_votes table...');
    await client.query(`
      CREATE TABLE feedback_votes (
        id SERIAL PRIMARY KEY,
        feedback_id INTEGER NOT NULL REFERENCES feedback_submissions(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(feedback_id, user_id)
      )
    `);

    // Create indexes for feedback tables
    await client.query(`
      CREATE INDEX idx_feedback_status ON feedback_submissions(status);
      CREATE INDEX idx_feedback_created_at ON feedback_submissions(created_at DESC);
      CREATE INDEX idx_feedback_votes_feedback_id ON feedback_votes(feedback_id);
      CREATE INDEX idx_feedback_votes_user_id ON feedback_votes(user_id);
    `);

    console.log('✅ Test database setup completed successfully!');

  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  setupTestDatabase().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = setupTestDatabase;
