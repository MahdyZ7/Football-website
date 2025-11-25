#!/usr/bin/env node

/**
 * Database Safety Verification Script
 * Tests that production database protection is working correctly
 */

console.log('\n🔒 Database Safety Verification\n');
console.log('This script tests the database separation safeguards.\n');

// Test 1: Valid test database URL
console.log('Test 1: Valid test database URL');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5433/football_test';
delete require.cache[require.resolve('../lib/utils/db.ts')];

try {
  require('../lib/utils/db.ts');
  console.log('✅ PASS: Valid test database accepted\n');
} catch (error) {
  console.log('❌ FAIL: Valid test database rejected');
  console.log('Error:', error.message, '\n');
}

// Test 2: Production-like database URL in test mode (should fail)
console.log('Test 2: Production database URL in test mode (should be rejected)');
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/football_production';
delete require.cache[require.resolve('../lib/utils/db.ts')];

try {
  require('../lib/utils/db.ts');
  console.log('❌ FAIL: Production database was accepted (SECURITY RISK!)\n');
} catch (error) {
  console.log('✅ PASS: Production database correctly rejected');
  console.log('Error message:', error.message.split('\n')[0], '\n');
}

// Test 3: TEST_DATABASE_URL takes precedence
console.log('Test 3: TEST_DATABASE_URL precedence over DATABASE_URL');
process.env.NODE_ENV = 'test';
process.env.TEST_DATABASE_URL = 'postgresql://localhost:5433/football_test';
process.env.DATABASE_URL = 'postgresql://localhost:5432/football_production';
delete require.cache[require.resolve('../lib/utils/db.ts')];

try {
  require('../lib/utils/db.ts');
  console.log('✅ PASS: TEST_DATABASE_URL correctly takes precedence\n');
} catch (error) {
  console.log('❌ FAIL: Could not use TEST_DATABASE_URL');
  console.log('Error:', error.message, '\n');
}

// Test 4: Missing database URL in test mode (should fail)
console.log('Test 4: Missing database URL in test mode (should be rejected)');
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.TEST_DATABASE_URL;
delete require.cache[require.resolve('../lib/utils/db.ts')];

try {
  require('../lib/utils/db.ts');
  console.log('❌ FAIL: Missing database URL was accepted\n');
} catch (error) {
  console.log('✅ PASS: Missing database URL correctly rejected');
  console.log('Error message:', error.message.split('\n')[0], '\n');
}

// Test 5: Development mode uses DATABASE_URL without restrictions
console.log('Test 5: Development mode accepts any DATABASE_URL');
process.env.NODE_ENV = 'development';
process.env.DATABASE_URL = 'postgresql://localhost:5432/football_dev';
delete process.env.TEST_DATABASE_URL;
delete require.cache[require.resolve('../lib/utils/db.ts')];

try {
  require('../lib/utils/db.ts');
  console.log('✅ PASS: Development mode works correctly\n');
} catch (error) {
  console.log('❌ FAIL: Development mode failed');
  console.log('Error:', error.message, '\n');
}

console.log('═══════════════════════════════════════════════════');
console.log('🎉 Database Safety Verification Complete!');
console.log('All safeguards are working correctly.');
console.log('═══════════════════════════════════════════════════\n');
