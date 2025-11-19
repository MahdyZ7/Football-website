import pool from '../lib/utils/db';
import fs from 'fs';
import path from 'path';

async function migrateAuth() {
  const client = await pool.connect();

  try {
    console.log('Starting authentication columns migration...');

    const sqlFilePath = path.join(__dirname, 'add_auth_columns.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    await client.query(sql);

    console.log('✅ Players table updated with user_id column');
    console.log('✅ Banned_users table updated with user_id column');
    console.log('✅ Admin_logs table updated with performed_by_user_id column');
    console.log('\nDatabase is ready for NextAuth.js integration!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAuth().catch(console.error);
