import pool from '../lib/utils/db';
import { readFileSync } from 'fs';
import { join } from 'path';
import readline from 'readline';

/**
 * Database Initialization Script
 *
 * This script initializes the database with all required tables and schemas.
 * It reads from the init-database.sql file and executes it.
 *
 * Usage:
 *   npm run db:init
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function initializeDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ⚽ Football League - Database Initialization');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Check if database is already initialized
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    const tableCount = parseInt(result.rows[0].count);

    if (tableCount > 0) {
      console.log(`⚠️  WARNING: Database already contains ${tableCount} tables.\n`);
      console.log('This script will CREATE tables using IF NOT EXISTS, which means:');
      console.log('  • Existing tables will NOT be modified');
      console.log('  • Missing tables will be created');
      console.log('  • Existing data will be preserved\n');

      const confirm = await question('Do you want to continue? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('\n❌ Initialization cancelled.');
        return;
      }
      console.log('');
    }
  } finally {
    client.release();
  }

  // Read SQL file
  console.log('📖 Reading initialization script...');
  const sqlPath = join(__dirname, 'init-database.sql');
  const sql = readFileSync(sqlPath, 'utf8');
  console.log('   ✅ SQL script loaded\n');

  // Execute SQL
  console.log('🚀 Initializing database...');
  const execClient = await pool.connect();

  try {
    await execClient.query('BEGIN');

    // Execute the entire SQL file
    await execClient.query(sql);

    await execClient.query('COMMIT');

    console.log('   ✅ Database initialization completed\n');

    // Show status
    console.log('📊 Checking database status...\n');
    const tablesResult = await execClient.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('Created/Verified Tables:');
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${(index + 1).toString().padStart(2)}. ${row.tablename}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database initialization successful!\n');

    console.log('Next Steps:');
    console.log('  1. Populate with development data: npm run db:seed:dev');
    console.log('  2. Or migrate existing data: npm run db:migrate:auth');
    console.log('  3. Start the application: npm run dev\n');

  } catch (error) {
    await execClient.query('ROLLBACK');
    console.error('\n❌ Initialization failed:', error);
    throw error;
  } finally {
    execClient.release();
    rl.close();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
