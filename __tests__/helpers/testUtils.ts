/**
 * Test Utilities
 * Helper functions and utilities for integration tests
 */

import { Pool, PoolClient } from 'pg';

/**
 * Test Database Pool with Production Safety Checks
 * Ensures tests never accidentally connect to production database
 */

// Shared test database pool - reuse across all tests
let testPool: Pool | null = null;

// Validate that we're using a test database
function validateTestDatabase(): string {
  const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'TEST DATABASE ERROR: No database URL configured.\n' +
      'Please ensure .env.test exists with TEST_DATABASE_URL or DATABASE_URL'
    );
  }

  // Safety check: ensure it's actually a test database
  const isTestDatabase =
    databaseUrl.includes('/football_test') ||
    databaseUrl.includes('/test_') ||
    databaseUrl.includes('_test') ||
    databaseUrl.includes('localhost:5433');

  if (!isTestDatabase) {
    throw new Error(
      'TEST DATABASE SAFETY: Refusing to run tests against non-test database!\n' +
      `Database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n` +
      'Expected: URL should contain "football_test", "test_", or "_test"\n' +
      'This prevents accidental contamination of production data.\n' +
      'Please check your .env.test configuration.'
    );
  }

  // Additional check: ensure we're in test environment
  if (process.env.NODE_ENV !== 'test') {
    console.warn(
      'WARNING: NODE_ENV is not set to "test". ' +
      'This may cause unexpected behavior. Current value:',
      process.env.NODE_ENV
    );
  }

  return databaseUrl;
}

export const getTestPool = () => {
  if (!testPool) {
    const connectionString = validateTestDatabase();

    testPool = new Pool({
      connectionString,
      ssl: false,
      max: 50, // Increased from 20 to handle 98 tests
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      allowExitOnIdle: false,
    });

    console.log('✓ Test database pool initialized with safety checks');
  }
  return testPool;
};

// Close the test pool (call in afterAll)
export async function closeTestPool() {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

// Get a client from the pool with retry logic
async function getClient(): Promise<PoolClient> {
  const pool = getTestPool();
  let retries = 3;
  let lastError;

  while (retries > 0) {
    try {
      return await pool.connect();
    } catch (error) {
      lastError = error;
      retries--;
      if (retries > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  throw lastError;
}

// Clean up test data between tests
export async function cleanupTestData(tables: string[]) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    // Don't close pool here - it's shared across all tests
  }
}

// Create test user
export async function createTestUser(
  email: string,
  name: string,
  isAdmin = false,
  userId = '00000000-0000-0000-0000-000000000099'
) {
  const client = await getClient();

  try {
    const result = await client.query(
      `INSERT INTO users (id, email, name, is_admin, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [userId, email, name, isAdmin]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

// Create test player
export async function createTestPlayer(
  intra: string,
  name: string,
  verified = false,
  userId: string | null = null
) {
  const client = await getClient();

  try {
    const result = await client.query(
      `INSERT INTO players (intra, name, verified, user_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [intra, name, verified, userId]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

// Create banned user
export async function createBannedUser(
  id: string,
  name: string,
  reason: string,
  durationDays = 7
) {
  const client = await getClient();

  try {
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + durationDays);

    const result = await client.query(
      `INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING *`,
      [id, name, reason, bannedUntil]
    );

    return result.rows[0];
  } finally {
    client.release();
  }
}

// Mock authenticated session
export function mockAuthenticatedSession(userId: string, isAdmin = false) {
  const mockSession = {
    user: {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
      isAdmin,
    },
    expires: new Date(Date.now() + 86400000).toISOString(), // 24 hours
  };

  return mockSession;
}

// Get all records from a table
export async function getAllRecords(tableName: string) {
  const client = await getClient();

  try {
    const result = await client.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } finally {
    client.release();
  }
}

// Check if user is banned
export async function isUserBanned(userId: string): Promise<boolean> {
  const client = await getClient();

  try {
    const result = await client.query(
      `SELECT * FROM banned_users
       WHERE id = $1 AND banned_until > NOW()`,
      [userId]
    );

    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
