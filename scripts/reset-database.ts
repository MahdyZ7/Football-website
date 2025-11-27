import pool from '../lib/utils/db';
import readline from 'readline';
import { spawnSync } from 'child_process';

/**
 * Database Reset Script
 *
 * This script completely resets the database by:
 * 1. Dropping all existing tables
 * 2. Reinitializing the schema
 * 3. Optionally seeding with development data
 *
 * ⚠️  WARNING: This will DELETE ALL DATA!
 *
 * Usage:
 *   npm run db:reset
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

async function resetDatabase() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ⚠️  DANGER ZONE - Database Reset');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🚨 This operation will:');
  console.log('   1. Drop ALL tables in the database');
  console.log('   2. Delete ALL data permanently');
  console.log('   3. Reinitialize the database schema');
  console.log('   4. Optionally seed with development data\n');

  console.log('💾 Recommendation: Create a backup first!');
  console.log('   Run: npm run db:backup\n');

  const confirm1 = await question('Are you sure you want to reset the database? (yes/no): ');
  if (confirm1.toLowerCase() !== 'yes') {
    console.log('\n✅ Reset cancelled. Your data is safe.');
    rl.close();
    process.exit(0);
  }

  const confirm2 = await question('\n⚠️  Type "DELETE ALL DATA" to confirm: ');
  if (confirm2 !== 'DELETE ALL DATA') {
    console.log('\n✅ Reset cancelled. Your data is safe.');
    rl.close();
    process.exit(0);
  }

  const seedData = await question('\nDo you want to seed with development data after reset? (yes/no): ');
  const shouldSeed = seedData.toLowerCase() === 'yes';

  console.log('\n🔄 Starting database reset...\n');

  const client = await pool.connect();

  try {
    // Get all tables
    console.log('📋 Finding all tables...');
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    const tables = tablesResult.rows.map(row => row.tablename);
    console.log(`   Found ${tables.length} tables\n`);

    if (tables.length === 0) {
      console.log('ℹ️  No tables found. Database is already empty.\n');
    } else {
      // Drop all tables
      console.log('🗑️  Dropping all tables...');
      await client.query('BEGIN');

      try {
        // Drop all tables in cascade mode
        for (const table of tables) {
          await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
          console.log(`   ✓ Dropped ${table}`);
        }

        // Drop extensions if needed
        await client.query('DROP EXTENSION IF EXISTS pgcrypto CASCADE');

        await client.query('COMMIT');
        console.log('   ✅ All tables dropped\n');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }

  } catch (error) {
    console.error('\n❌ Error during reset:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
    rl.close();
  }

  // Reinitialize database
  console.log('🔄 Reinitializing database schema...\n');
  const initResult = spawnSync('npx', ['tsx', 'scripts/init-database.ts'], {
    stdio: 'inherit',
    env: { ...process.env, SKIP_CONFIRM: 'true' }
  });

  if (initResult.status !== 0) {
    console.error('\n❌ Failed to reinitialize database');
    process.exit(1);
  }

  // Seed data if requested
  if (shouldSeed) {
    console.log('\n🌱 Seeding development data...\n');
    const seedResult = spawnSync('npx', ['tsx', 'scripts/seed-dev-data.ts'], {
      stdio: 'inherit'
    });

    if (seedResult.status !== 0) {
      console.error('\n❌ Failed to seed development data');
      process.exit(1);
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database reset completed successfully!\n');

  if (shouldSeed) {
    console.log('🎉 Your database is now ready with fresh development data.');
  } else {
    console.log('📝 Your database schema is ready. Run "npm run db:seed:dev" to add data.');
  }
  console.log('');
}

// Run the reset
resetDatabase().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
