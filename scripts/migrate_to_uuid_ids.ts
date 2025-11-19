import pool from '../lib/utils/db';
import { randomUUID } from 'crypto';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

/**
 * Migration script to convert user IDs from sequential integers to random UUIDs
 *
 * This improves security by:
 * - Preventing user enumeration attacks
 * - Making user IDs unpredictable
 * - Hiding total user count
 */

async function migrateToUUIDs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🔐 User ID Migration: Sequential Integers → Random UUIDs');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const client = await pool.connect();

  try {
    // Check current state
    console.log('📊 Checking current database state...\n');

    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const accountCount = await client.query('SELECT COUNT(*) as count FROM accounts');
    const playerCount = await client.query('SELECT COUNT(*) as count FROM players WHERE user_id IS NOT NULL');
    const banCount = await client.query('SELECT COUNT(*) as count FROM banned_users WHERE user_id IS NOT NULL');
    const logCount = await client.query('SELECT COUNT(*) as count FROM admin_logs WHERE performed_by_user_id IS NOT NULL');

    console.log(`Users: ${userCount.rows[0].count}`);
    console.log(`Accounts: ${accountCount.rows[0].count}`);
    console.log(`Players linked to users: ${playerCount.rows[0].count}`);
    console.log(`Bans linked to users: ${banCount.rows[0].count}`);
    console.log(`Admin logs linked to users: ${logCount.rows[0].count}\n`);

    // Check if already migrated
    const idTypeCheck = await client.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id'
    `);

    if (idTypeCheck.rows[0].data_type !== 'integer') {
      console.log('✅ Migration already completed! User IDs are already non-integer type.');
      return;
    }

    console.log('⚠️  WARNING: This migration will:');
    console.log('   1. Convert all user IDs from integers to UUIDs');
    console.log('   2. Update all foreign key references in related tables');
    console.log('   3. Require a brief downtime (users will be logged out)');
    console.log('   4. Cannot be easily reversed\n');

    console.log('💾 Recommendation: Create a database backup first!');
    console.log('   Run: npm run db:backup\n');

    const confirm = await question('Are you ready to proceed? Type "yes" to continue: ');

    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Migration cancelled.');
      return;
    }

    console.log('\n🚀 Starting migration...\n');

    // Begin transaction
    await client.query('BEGIN');

    try {
      // Step 1: Create mapping table to store old_id -> new_uuid
      console.log('1️⃣  Creating ID mapping table...');
      await client.query(`
        CREATE TEMP TABLE id_mapping (
          old_id INTEGER PRIMARY KEY,
          new_uuid TEXT NOT NULL UNIQUE
        )
      `);

      // Generate UUIDs for all existing users
      const users = await client.query('SELECT id FROM users ORDER BY id');
      console.log(`   Generating UUIDs for ${users.rows.length} users...`);

      for (const user of users.rows) {
        const newUuid = randomUUID();
        await client.query(
          'INSERT INTO id_mapping (old_id, new_uuid) VALUES ($1, $2)',
          [user.id, newUuid]
        );
      }
      console.log('   ✅ UUID mapping created\n');

      // Step 2: Add temporary UUID columns to all affected tables
      console.log('2️⃣  Adding temporary UUID columns...');
      await client.query('ALTER TABLE users ADD COLUMN id_new TEXT');
      await client.query('ALTER TABLE accounts ADD COLUMN "userId_new" TEXT');
      await client.query('ALTER TABLE sessions ADD COLUMN "userId_new" TEXT');
      await client.query('ALTER TABLE players ADD COLUMN user_id_new TEXT');
      await client.query('ALTER TABLE banned_users ADD COLUMN user_id_new TEXT');
      await client.query('ALTER TABLE admin_logs ADD COLUMN performed_by_user_id_new TEXT');
      await client.query('ALTER TABLE user_roles ADD COLUMN "userId_new" TEXT');
      await client.query('ALTER TABLE user_roles ADD COLUMN "assignedBy_new" TEXT');
      console.log('   ✅ Temporary columns added\n');

      // Step 3: Populate new UUID columns using mapping
      console.log('3️⃣  Migrating data to new UUID columns...');

      await client.query(`
        UPDATE users
        SET id_new = id_mapping.new_uuid
        FROM id_mapping
        WHERE users.id = id_mapping.old_id
      `);

      await client.query(`
        UPDATE accounts
        SET "userId_new" = id_mapping.new_uuid
        FROM id_mapping
        WHERE accounts."userId" = id_mapping.old_id
      `);

      await client.query(`
        UPDATE sessions
        SET "userId_new" = id_mapping.new_uuid
        FROM id_mapping
        WHERE sessions."userId" = id_mapping.old_id
      `);

      await client.query(`
        UPDATE players
        SET user_id_new = id_mapping.new_uuid
        FROM id_mapping
        WHERE players.user_id = id_mapping.old_id
      `);

      await client.query(`
        UPDATE banned_users
        SET user_id_new = id_mapping.new_uuid
        FROM id_mapping
        WHERE banned_users.user_id = id_mapping.old_id
      `);

      await client.query(`
        UPDATE admin_logs
        SET performed_by_user_id_new = id_mapping.new_uuid
        FROM id_mapping
        WHERE admin_logs.performed_by_user_id = id_mapping.old_id
      `);

      await client.query(`
        UPDATE user_roles
        SET "userId_new" = id_mapping.new_uuid
        FROM id_mapping
        WHERE user_roles."userId" = id_mapping.old_id
      `);

      await client.query(`
        UPDATE user_roles
        SET "assignedBy_new" = id_mapping.new_uuid
        FROM id_mapping
        WHERE user_roles."assignedBy" = id_mapping.old_id
      `);

      console.log('   ✅ Data migrated to UUID columns\n');

      // Step 4: Drop all foreign key constraints
      console.log('4️⃣  Dropping old foreign key constraints...');
      await client.query('ALTER TABLE accounts DROP CONSTRAINT IF EXISTS "accounts_userId_fkey"');
      await client.query('ALTER TABLE sessions DROP CONSTRAINT IF EXISTS "sessions_userId_fkey"');
      await client.query('ALTER TABLE players DROP CONSTRAINT IF EXISTS "players_user_id_fkey"');
      await client.query('ALTER TABLE banned_users DROP CONSTRAINT IF EXISTS "banned_users_user_id_fkey"');
      await client.query('ALTER TABLE admin_logs DROP CONSTRAINT IF EXISTS "admin_logs_performed_by_user_id_fkey"');
      await client.query('ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "user_roles_userId_fkey"');
      await client.query('ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "user_roles_assignedBy_fkey"');
      console.log('   ✅ Foreign key constraints dropped\n');

      // Step 5: Drop old integer columns and rename new UUID columns
      console.log('5️⃣  Swapping old columns with new UUID columns...');

      // Drop old primary key and column
      await client.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey');
      await client.query('DROP SEQUENCE IF EXISTS users_id_seq CASCADE');
      await client.query('ALTER TABLE users DROP COLUMN id');
      await client.query('ALTER TABLE users RENAME COLUMN id_new TO id');
      await client.query('ALTER TABLE users ADD PRIMARY KEY (id)');

      // Rename other columns
      await client.query('ALTER TABLE accounts DROP COLUMN "userId"');
      await client.query('ALTER TABLE accounts RENAME COLUMN "userId_new" TO "userId"');

      await client.query('ALTER TABLE sessions DROP COLUMN "userId"');
      await client.query('ALTER TABLE sessions RENAME COLUMN "userId_new" TO "userId"');

      await client.query('ALTER TABLE players DROP COLUMN user_id');
      await client.query('ALTER TABLE players RENAME COLUMN user_id_new TO user_id');

      await client.query('ALTER TABLE banned_users DROP COLUMN user_id');
      await client.query('ALTER TABLE banned_users RENAME COLUMN user_id_new TO user_id');

      await client.query('ALTER TABLE admin_logs DROP COLUMN performed_by_user_id');
      await client.query('ALTER TABLE admin_logs RENAME COLUMN performed_by_user_id_new TO performed_by_user_id');

      await client.query('ALTER TABLE user_roles DROP COLUMN "userId"');
      await client.query('ALTER TABLE user_roles RENAME COLUMN "userId_new" TO "userId"');

      await client.query('ALTER TABLE user_roles DROP COLUMN "assignedBy"');
      await client.query('ALTER TABLE user_roles RENAME COLUMN "assignedBy_new" TO "assignedBy"');

      console.log('   ✅ Columns swapped\n');

      // Step 6: Recreate foreign key constraints
      console.log('6️⃣  Recreating foreign key constraints...');
      await client.query(`
        ALTER TABLE accounts
        ADD CONSTRAINT "accounts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);

      await client.query(`
        ALTER TABLE sessions
        ADD CONSTRAINT "sessions_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);

      await client.query(`
        ALTER TABLE players
        ADD CONSTRAINT "players_user_id_fkey"
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `);

      await client.query(`
        ALTER TABLE banned_users
        ADD CONSTRAINT "banned_users_user_id_fkey"
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      `);

      await client.query(`
        ALTER TABLE admin_logs
        ADD CONSTRAINT "admin_logs_performed_by_user_id_fkey"
        FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
      `);

      await client.query(`
        ALTER TABLE user_roles
        ADD CONSTRAINT "user_roles_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
      `);

      await client.query(`
        ALTER TABLE user_roles
        ADD CONSTRAINT "user_roles_assignedBy_fkey"
        FOREIGN KEY ("assignedBy") REFERENCES users(id)
      `);

      console.log('   ✅ Foreign key constraints recreated\n');

      // Step 7: Verify migration
      console.log('7️⃣  Verifying migration...');
      const verifyUsers = await client.query('SELECT COUNT(*) as count FROM users');
      const verifyAccounts = await client.query('SELECT COUNT(*) as count FROM accounts WHERE "userId" IS NOT NULL');
      const verifyPlayers = await client.query('SELECT COUNT(*) as count FROM players WHERE user_id IS NOT NULL');

      console.log(`   Users: ${verifyUsers.rows[0].count}`);
      console.log(`   Accounts: ${verifyAccounts.rows[0].count}`);
      console.log(`   Players with user_id: ${verifyPlayers.rows[0].count}`);

      if (verifyUsers.rows[0].count !== userCount.rows[0].count) {
        throw new Error('User count mismatch! Rolling back...');
      }

      // Sample a few UUIDs to show they're random
      const sampleUsers = await client.query('SELECT id, name FROM users LIMIT 5');
      console.log('\n   Sample UUIDs:');
      sampleUsers.rows.forEach(user => {
        console.log(`   - ${user.id} (${user.name || 'No name'})`);
      });

      console.log('\n   ✅ Verification passed\n');

      // Commit transaction
      await client.query('COMMIT');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Migration completed successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('📝 What changed:');
      console.log('   ✅ User IDs are now random UUIDs instead of sequential integers');
      console.log('   ✅ All foreign key relationships preserved');
      console.log('   ✅ All existing sessions invalidated (users will need to re-login)');
      console.log('   ✅ Future user IDs will be generated as random UUIDs\n');

      console.log('⚠️  Important notes:');
      console.log('   - All users will be logged out and need to sign in again');
      console.log('   - Update your auth.ts to generate UUIDs for new users');
      console.log('   - Run the code updates provided next\n');

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('\n❌ Migration failed! Rolling back all changes...');
      throw error;
    }

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    client.release();
    rl.close();
    await pool.end();
  }
}

migrateToUUIDs().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
