import { Pool } from 'pg';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

/**
 * Database Connection Pool with Test/Production Separation
 *
 * SAFETY MEASURES:
 * 1. In test mode (NODE_ENV=test), only TEST_DATABASE_URL is allowed
 * 2. Production database access is blocked during tests
 * 3. Database URL must contain '_test' suffix when running tests
 */

// Validate database configuration to prevent production contamination
function validateDatabaseConfig(): string {
  const isTestEnvironment = process.env.NODE_ENV === 'test';
  const databaseUrl = process.env.DATABASE_URL;
  const testDatabaseUrl = process.env.TEST_DATABASE_URL;

  // In test mode, enforce strict separation
  if (isTestEnvironment) {
    // Prefer TEST_DATABASE_URL if explicitly set
    if (testDatabaseUrl) {
      console.log('✓ Using TEST_DATABASE_URL for test environment');
      return testDatabaseUrl;
    }

    // If DATABASE_URL is used, validate it's actually a test database
    if (!databaseUrl) {
      throw new Error(
        'TEST DATABASE SAFETY: No database URL configured for test environment. ' +
        'Please set TEST_DATABASE_URL or DATABASE_URL in .env.test file.'
      );
    }

    // Safety check: ensure the database name contains '_test' or 'test_'
    const isTestDatabase =
      databaseUrl.includes('/football_test') ||
      databaseUrl.includes('/test_') ||
      databaseUrl.includes('_test') ||
      databaseUrl.includes('localhost:5433'); // Common test port

    if (!isTestDatabase) {
      throw new Error(
        'TEST DATABASE SAFETY: DATABASE_URL does not appear to be a test database.\n' +
        `Current URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n` +
        'Expected: URL should contain "football_test", "test_", or "_test"\n' +
        'This prevents accidental contamination of production data.\n' +
        'Please update .env.test with a proper test database URL.'
      );
    }

    console.log('✓ Validated test database URL');
    return databaseUrl;
  }

  // In production/development, use DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  return databaseUrl;
}

const connectionString = validateDatabaseConfig();

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: false }
});

// Log connection info (sanitized) for debugging
if (process.env.NODE_ENV !== 'production') {
  const sanitized = connectionString.replace(/:[^:@]+@/, ':****@');
  console.log(`Database pool initialized for ${process.env.NODE_ENV || 'development'} environment`);
  console.log(`Connection: ${sanitized}`);
}

export default pool;