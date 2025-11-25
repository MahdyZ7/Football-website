# Database Separation: Test vs Production

This document explains the database separation strategy implemented to prevent accidental contamination of production data during testing.

## Overview

The application enforces **strict separation** between test and production databases through multiple layers of safeguards:

1. **Environment-based configuration** (`.env` vs `.env.test`)
2. **Automatic validation** in database connection logic
3. **Naming conventions** that must be followed
4. **Safety checks** that block invalid configurations

## Quick Start

### For Development
```bash
# Use .env file with production database
DATABASE_URL=postgresql://user:pass@host:5432/football_production
npm run dev
```

### For Testing
```bash
# Use .env.test file with test database
TEST_DATABASE_URL=postgresql://test_user:test_pass@localhost:5433/football_test
npm test
```

## Database Naming Requirements

### Test Databases MUST Include
Test database URLs must contain one of the following patterns:
- `football_test` (recommended)
- `_test` suffix (e.g., `mydb_test`)
- `test_` prefix (e.g., `test_mydb`)
- Port `5433` (common test database port)

### Examples

✅ **Valid Test Database URLs:**
```
postgresql://localhost:5433/football_test
postgresql://localhost/football_test
postgresql://localhost/myapp_test
postgresql://localhost/test_football
```

❌ **Invalid Test Database URLs:**
```
postgresql://localhost:5432/football          # No test indicator
postgresql://localhost/football_production    # Production name
postgresql://production-db:5432/football      # Production host
```

## Environment Configuration

### `.env` (Production/Development)
```bash
# Production database
DATABASE_URL=postgresql://user:password@host:5432/football_production

# Other production configs...
NEXTAUTH_SECRET=production-secret-key
```

### `.env.test` (Testing)
```bash
# Test database (preferred)
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/football_test

# Fallback for backward compatibility
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/football_test

# Test configs
NODE_ENV=test
NEXTAUTH_SECRET=test-secret-key
```

## Safety Mechanisms

### 1. Database Connection Validation (`lib/utils/db.ts`)

When `NODE_ENV=test`, the database connection:
- ✅ Prefers `TEST_DATABASE_URL` if set
- ✅ Falls back to `DATABASE_URL` with validation
- ✅ Checks that URL contains test indicators
- ❌ **Throws error** if URL looks like production database

**Example Error:**
```
TEST DATABASE SAFETY: DATABASE_URL does not appear to be a test database.
Current URL: postgresql://localhost:5432/****@football_production
Expected: URL should contain "football_test", "test_", or "_test"
This prevents accidental contamination of production data.
```

### 2. Test Utilities Validation (`__tests__/helpers/testUtils.ts`)

The `getTestPool()` function:
- ✅ Validates database URL before creating pool
- ✅ Checks for test naming patterns
- ✅ Warns if `NODE_ENV` is not "test"
- ❌ **Refuses to connect** to non-test databases

### 3. NPM Scripts Protection

All test scripts explicitly set `NODE_ENV=test`:
```json
{
  "test": "TZ=UTC NODE_ENV=test jest",
  "test:watch": "TZ=UTC NODE_ENV=test jest --watch",
  "test:coverage": "TZ=UTC NODE_ENV=test jest --coverage",
  "test:db:setup": "TZ=UTC NODE_ENV=test node scripts/test-db-setup.js"
}
```

## Setting Up Test Database

### 1. Create Test Database
```bash
# PostgreSQL example
createdb football_test

# Or using psql
psql -U postgres
CREATE DATABASE football_test;
\q
```

### 2. Configure Environment
```bash
# Copy example to .env.test
cp .env.example .env.test

# Edit .env.test
nano .env.test
```

Set the test database URL:
```bash
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/football_test
```

### 3. Initialize Test Database Schema
```bash
npm run test:db:setup
```

This creates all required tables in the test database.

### 4. Run Tests
```bash
npm test
```

## Common Workflows

### Running Tests Locally
```bash
# 1. Ensure .env.test is configured
cat .env.test | grep TEST_DATABASE_URL

# 2. Setup test database (if not done)
npm run test:db:setup

# 3. Run tests
npm test

# 4. Run tests with coverage
npm run test:coverage
```

### CI/CD Pipeline
```yaml
# GitHub Actions example
- name: Setup test database
  env:
    TEST_DATABASE_URL: postgresql://test:test@localhost:5432/football_test
  run: npm run test:db:setup

- name: Run tests
  env:
    NODE_ENV: test
    TEST_DATABASE_URL: postgresql://test:test@localhost:5432/football_test
  run: npm test
```

### Database Reset Between Tests
```bash
# Clean and reseed test database
npm run test:db:setup
npm run test:db:seed
```

## Troubleshooting

### Error: "DATABASE_URL does not appear to be a test database"

**Cause:** Your database URL doesn't contain test indicators.

**Solution:**
```bash
# Update .env.test
TEST_DATABASE_URL=postgresql://localhost:5433/football_test

# Or ensure DATABASE_URL has test indicators
DATABASE_URL=postgresql://localhost/myapp_test
```

### Error: "No database URL configured for test environment"

**Cause:** Neither `TEST_DATABASE_URL` nor `DATABASE_URL` is set in `.env.test`.

**Solution:**
```bash
# Create .env.test if missing
cp .env.example .env.test

# Add test database URL
echo "TEST_DATABASE_URL=postgresql://localhost:5433/football_test" >> .env.test
```

### Tests Connect to Production Database

**This should be IMPOSSIBLE** with the current safeguards. If this happens:

1. Check `NODE_ENV` is set to "test"
2. Verify `.env.test` exists and is loaded
3. Confirm database URL contains test indicators
4. Review `lib/utils/db.ts` validation logic

### Database Connection Pool Exhaustion

**Symptoms:** Tests timeout or fail with "connection pool exhausted"

**Solutions:**
```typescript
// In test files, ensure cleanup
afterAll(async () => {
  await cleanupTestData(['players', 'users', 'banned_users']);
  await closeTestPool(); // Important!
});

// In global teardown
import { closeTestPool } from './helpers/testUtils';
export default async function globalTeardown() {
  await closeTestPool();
}
```

## Best Practices

### DO ✅
- Always use separate physical databases for test and production
- Use different ports for test databases (e.g., 5433 for test, 5432 for prod)
- Use `TEST_DATABASE_URL` in `.env.test` for clarity
- Run `npm run test:db:setup` before first test run
- Include test indicators in database names (`_test`, `football_test`)
- Review test database configuration in CI/CD pipelines

### DON'T ❌
- Never point test configuration to production database
- Don't use same database for test and development
- Don't commit `.env` or `.env.test` with real credentials
- Don't disable safety checks in `lib/utils/db.ts`
- Don't skip database cleanup in tests
- Don't run tests without `NODE_ENV=test`

## Database Schema Management

### Production Database Migrations
```bash
# Run migrations on production database
NODE_ENV=production npm run db:migrate:auth
NODE_ENV=production npm run db:migrate:feedback
```

### Test Database Setup
```bash
# Complete schema setup for tests
NODE_ENV=test npm run test:db:setup
```

The test setup script (`scripts/test-db-setup.js`) creates a complete schema from scratch, ensuring test database matches production structure.

## Monitoring and Debugging

### Check Database Connection
```typescript
// In any file using the database
import pool from '@/lib/utils/db';

// The validation runs automatically when pool is created
// Check logs for:
// "✓ Using TEST_DATABASE_URL for test environment"
// "✓ Validated test database URL"
```

### Test Database Status
```bash
# Check test database tables
NODE_ENV=test psql $TEST_DATABASE_URL -c "\dt"

# Check row counts
NODE_ENV=test psql $TEST_DATABASE_URL -c "SELECT 'players' as table, COUNT(*) FROM players UNION ALL SELECT 'users', COUNT(*) FROM users;"
```

## Security Considerations

1. **Isolation:** Test and production databases should be on separate servers/instances in production environments
2. **Credentials:** Use different credentials for test and production databases
3. **Access Control:** Limit test database access to development/CI environments only
4. **Data Sanitization:** Never copy production data to test databases without proper sanitization
5. **CI/CD Secrets:** Store `TEST_DATABASE_URL` as encrypted secrets in CI/CD platforms

## Migration Guide

If upgrading from a version without database separation:

### Step 1: Create Test Database
```bash
createdb football_test
```

### Step 2: Create `.env.test`
```bash
cp .env.example .env.test
# Edit TEST_DATABASE_URL to point to football_test
```

### Step 3: Initialize Test Schema
```bash
npm run test:db:setup
```

### Step 4: Update CI/CD
Update your CI/CD configuration to use `TEST_DATABASE_URL` and `NODE_ENV=test`.

### Step 5: Verify
```bash
npm test
# Should see: "✓ Validated test database URL"
```

## Summary

The database separation system provides **multiple layers of protection**:

1. **Environment Variables:** Separate `.env` and `.env.test` files
2. **Naming Validation:** Database URLs must contain test indicators
3. **Runtime Checks:** Automatic validation when creating database pools
4. **NPM Scripts:** All test commands set `NODE_ENV=test`
5. **Test Utilities:** Additional validation in test helper functions

This makes it **virtually impossible** to accidentally contaminate production data during testing, while maintaining developer convenience with sensible defaults and clear error messages.

## Questions?

If you encounter issues or have questions:
1. Check error messages - they include specific guidance
2. Review this documentation
3. Verify `.env.test` configuration
4. Check `lib/utils/db.ts` for validation logic
5. Open an issue on GitHub with error details
