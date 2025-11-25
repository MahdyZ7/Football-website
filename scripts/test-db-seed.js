#!/usr/bin/env node

/**
 * Test Database Seeding Script
 * Populates test database with sample data
 * Run before tests: npm run test:db:seed
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function seedTestDatabase() {
  console.log('🌱 Seeding test database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create test users
    console.log('  → Creating test users...');
    const usersResult = await client.query(`
      INSERT INTO users (id, name, email, is_admin, role, created_at) VALUES
      ('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin@test.com', true, 'admin', NOW()),
      ('00000000-0000-0000-0000-000000000002', 'John Doe', 'john@test.com', false, 'user', NOW()),
      ('00000000-0000-0000-0000-000000000003', 'Jane Smith', 'jane@test.com', false, 'user', NOW()),
      ('00000000-0000-0000-0000-000000000004', 'Bob Wilson', 'bob@test.com', false, 'user', NOW()),
      ('00000000-0000-0000-0000-000000000005', 'Alice Brown', 'alice@test.com', false, 'user', NOW()),
      ('00000000-0000-0000-0000-000000000006', 'Service Account', 'service@test.com', false, 'service', NOW())
      RETURNING id
    `);
    console.log(`    ✅ Created ${usersResult.rowCount} users`);

    // Create test players
    console.log('  → Creating test players...');
    const playersResult = await client.query(`
      INSERT INTO players (name, intra, verified, user_id, created_at) VALUES
      ('John Doe', 'jdoe', true, '00000000-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),
      ('Jane Smith', 'jsmith', true, '00000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day'),
      ('Bob Wilson', 'bwilson', false, '00000000-0000-0000-0000-000000000004', NOW() - INTERVAL '5 hours'),
      ('Alice Brown', 'abrown', true, '00000000-0000-0000-0000-000000000005', NOW() - INTERVAL '3 hours'),
      ('Charlie Davis', 'cdavis', false, NULL, NOW() - INTERVAL '1 hour')
    `);
    console.log(`    ✅ Created ${playersResult.rowCount} players`);

    // Create test money records
    console.log('  → Creating test money records...');
    const moneyResult = await client.query(`
      INSERT INTO money (date, name, intra, amount, paid, user_id) VALUES
      (NOW() - INTERVAL '7 days', 'John Doe', 'jdoe', 50, true, '00000000-0000-0000-0000-000000000002'),
      (NOW() - INTERVAL '7 days', 'Jane Smith', 'jsmith', 50, true, '00000000-0000-0000-0000-000000000003'),
      (NOW() - INTERVAL '7 days', 'Bob Wilson', 'bwilson', 50, false, '00000000-0000-0000-0000-000000000004'),
      (NOW() - INTERVAL '7 days', 'Alice Brown', 'abrown', 50, true, '00000000-0000-0000-0000-000000000005')
    `);
    console.log(`    ✅ Created ${moneyResult.rowCount} money records`);

    // Create test expenses
    console.log('  → Creating test expenses...');
    const expensesResult = await client.query(`
      INSERT INTO expenses (name, amount, date, invoice_id) VALUES
      ('Football field rental', 300, NOW() - INTERVAL '7 days', 'INV-001'),
      ('Equipment purchase', 150, NOW() - INTERVAL '14 days', 'INV-002'),
      ('Referee fees', 100, NOW() - INTERVAL '21 days', 'INV-003')
    `);
    console.log(`    ✅ Created ${expensesResult.rowCount} expenses`);

    // Create test inventory
    console.log('  → Creating test inventory...');
    const inventoryResult = await client.query(`
      INSERT INTO inventory (name, amount) VALUES
      ('Footballs', 10),
      ('Cones', 20),
      ('Jerseys - Team 1', 15),
      ('Jerseys - Team 2', 15),
      ('Water bottles', 25)
    `);
    console.log(`    ✅ Created ${inventoryResult.rowCount} inventory items`);

    // Create test banned user
    console.log('  → Creating test banned users...');
    const bannedResult = await client.query(`
      INSERT INTO banned_users (id, name, reason, banned_at, banned_until, user_id) VALUES
      ('banned_user_1', 'Banned Player', 'Unsportsmanlike conduct', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', NULL)
    `);
    console.log(`    ✅ Created ${bannedResult.rowCount} banned users`);

    // Create test admin logs
    console.log('  → Creating test admin logs...');
    const logsResult = await client.query(`
      INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, timestamp, performed_by_user_id) VALUES
      ('admin@test.com', 'ban_user', 'banned_user_1', 'Banned Player', 'Banned for 7 days: Unsportsmanlike conduct', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001'),
      ('admin@test.com', 'verify_user', 'jdoe', 'John Doe', 'User verified', NOW() - INTERVAL '2 days', '00000000-0000-0000-0000-000000000001'),
      ('admin@test.com', 'verify_user', 'jsmith', 'Jane Smith', 'User verified', NOW() - INTERVAL '1 day', '00000000-0000-0000-0000-000000000001')
    `);
    console.log(`    ✅ Created ${logsResult.rowCount} admin logs`);

    // Create test feedback submissions
    console.log('  → Creating test feedback submissions...');
    const feedbackResult = await client.query(`
      INSERT INTO feedback_submissions (type, title, description, status, is_approved, upvotes, downvotes, user_id, approved_by_user_id, created_at) VALUES
      ('feature', 'Add player statistics', 'Would love to see individual player statistics tracked over time', 'approved', true, 5, 1, '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days'),
      ('bug', 'Registration page loading slow', 'The registration page takes too long to load on mobile', 'in_progress', true, 3, 0, '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
      ('feature', 'Dark mode toggle', 'Please add a dark mode option for night games', 'pending', false, 0, 0, '00000000-0000-0000-0000-000000000004', NULL, NOW() - INTERVAL '1 hour'),
      ('feedback', 'Great website!', 'Really enjoying the new features. Keep up the good work!', 'approved', true, 8, 0, '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days')
    `);
    console.log(`    ✅ Created ${feedbackResult.rowCount} feedback submissions`);

    // Create test feedback votes
    console.log('  → Creating test feedback votes...');
    const votesResult = await client.query(`
      INSERT INTO feedback_votes (feedback_id, user_id, vote_type) VALUES
      (1, '00000000-0000-0000-0000-000000000003', 'upvote'),
      (1, '00000000-0000-0000-0000-000000000004', 'upvote'),
      (2, '00000000-0000-0000-0000-000000000002', 'upvote'),
      (4, '00000000-0000-0000-0000-000000000002', 'upvote'),
      (4, '00000000-0000-0000-0000-000000000003', 'upvote')
    `);
    console.log(`    ✅ Created ${votesResult.rowCount} feedback votes`);

    await client.query('COMMIT');
    console.log('✅ Test database seeded successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Test database seeding failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  seedTestDatabase().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seedTestDatabase;
