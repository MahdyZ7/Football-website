/**
 * Global teardown for Jest tests
 * Closes the database pool after all tests complete
 */

import { closeTestPool } from './helpers/testUtils';

export default async function globalTeardown() {
  console.log('\n🧹 Closing test database pool...');
  try {
    await closeTestPool();
    console.log('✅ Test database pool closed\n');
  } catch (error) {
    console.log('⚠️  Pool already closed or not initialized\n');
  }
}
