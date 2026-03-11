#!/usr/bin/env node

/**
 * Test Database Teardown Script
 * Cleans up test database after tests complete
 * Run after tests: npm run test:db:teardown
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is required for test database teardown.');
}

const pool = new Pool({
  connectionString: process.env.TEST_DATABASE_URL,
  ssl: false
});

async function teardownTestDatabase() {
  console.log('🧹 Tearing down test database...');
  const client = await pool.connect();

  try {
    // Truncate all tables (fast cleanup)
    console.log('  → Truncating tables...');
    await client.query(`
      TRUNCATE TABLE
        feedback_votes,
        feedback_submissions,
        admin_logs,
        banned_users,
        inventory,
        expenses,
        money,
        players,
        sessions,
        accounts,
        verification_tokens,
        users
      CASCADE
    `);

    console.log('✅ Test database cleaned up successfully!');

  } catch (error) {
    console.error('❌ Test database teardown failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  teardownTestDatabase().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = teardownTestDatabase;
