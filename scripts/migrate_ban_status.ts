import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrateBanStatus() {
  const client = await pool.connect();

  try {
    console.log('Starting ban status migration...\n');

    await client.query('BEGIN');

    console.log('Adding is_banned column to players table...');
    await client.query(`
      ALTER TABLE players ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE
    `);
    console.log('  ✓ is_banned column added\n');

    await client.query('COMMIT');
    console.log('Ban status migration completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrateBanStatus();
