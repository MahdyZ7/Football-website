import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DEFAULT_CONFIG } from '../lib/config/defaults';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function migrateSiteConfig() {
  const client = await pool.connect();

  try {
    console.log('Starting site config migration...\n');

    await client.query('BEGIN');

    // Read and execute SQL file
    const sqlPath = path.join(__dirname, 'migrate_site_config.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Creating site_config and site_config_snapshots tables...');
    await client.query(sql);
    console.log('✓ Tables created');

    // Seed default config if not exists
    const existing = await client.query('SELECT id FROM site_config WHERE id = 1');
    if (existing.rows.length === 0) {
      await client.query(
        'INSERT INTO site_config (id, config, version) VALUES (1, $1, 1)',
        [JSON.stringify(DEFAULT_CONFIG)]
      );
      console.log('✓ Default configuration seeded');
    } else {
      console.log('ℹ Configuration already exists, skipping seed');
    }

    await client.query('COMMIT');

    // Verify tables
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('site_config', 'site_config_snapshots')
      ORDER BY table_name
    `);

    console.log('\nVerification:');
    tables.rows.forEach((row: { table_name: string }) => {
      console.log(`  ✓ ${row.table_name} exists`);
    });

    console.log('\nSite config migration completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateSiteConfig().catch((err) => {
  console.error(err);
  process.exit(1);
});
