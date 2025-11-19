import pool from '../lib/utils/db';
import { randomBytes } from 'crypto';

/**
 * Setup script to create a service account for automated tasks
 * This creates a special user account that can be used by cron jobs
 * and other automated processes to perform administrative tasks.
 */

async function setupServiceAccount() {
  const client = await pool.connect();

  try {
    console.log('🔧 Setting up service account for automated tasks...\n');

    // Check if service account already exists
    const existingAccount = await client.query(
      "SELECT id, name, email, role FROM users WHERE email = $1",
      ['service@system.local']
    );

    let serviceUserId: number;

    if (existingAccount.rows.length > 0) {
      serviceUserId = existingAccount.rows[0].id;
      console.log('✅ Service account already exists:');
      console.log(`   ID: ${serviceUserId}`);
      console.log(`   Email: ${existingAccount.rows[0].email}`);
      console.log(`   Role: ${existingAccount.rows[0].role}\n`);

      // Update role if needed
      if (existingAccount.rows[0].role !== 'service') {
        await client.query(
          "UPDATE users SET role = 'service' WHERE id = $1",
          [serviceUserId]
        );
        console.log('✅ Updated role to "service"\n');
      }
    } else {
      // Create new service account
      const result = await client.query(`
        INSERT INTO users (name, email, role, "emailVerified")
        VALUES ($1, $2, $3, NOW())
        RETURNING id
      `, ['System Service Account', 'service@system.local', 'service']);

      serviceUserId = result.rows[0].id;
      console.log('✅ Service account created:');
      console.log(`   ID: ${serviceUserId}`);
      console.log(`   Email: service@system.local`);
      console.log(`   Role: service\n`);
    }

    // Generate a secure API key
    const apiKey = randomBytes(32).toString('hex');

    console.log('🔑 Generated API Key (save this securely!):\n');
    console.log('─'.repeat(80));
    console.log(apiKey);
    console.log('─'.repeat(80));
    console.log('\n📝 Add these to your .env file:\n');
    console.log(`SERVICE_ACCOUNT_USER_ID=${serviceUserId}`);
    console.log(`SERVICE_API_KEY=${apiKey}`);
    console.log('\n⚠️  IMPORTANT: This API key will only be shown once!');
    console.log('   Copy it now and store it securely in your environment variables.\n');

    console.log('📋 Next steps:');
    console.log('   1. Add the above environment variables to your .env file');
    console.log('   2. Add the same variables to your cron job environment');
    console.log('   3. Update your cron job to use the new API key authentication\n');

  } catch (error) {
    console.error('❌ Error setting up service account:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupServiceAccount().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
