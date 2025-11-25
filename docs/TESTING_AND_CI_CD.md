# Testing and CI/CD Guide

This guide explains how to set up and use the development database and CI/CD testing pipeline for the Football Club Registration website.

## Table of Contents

- [Overview](#overview)
- [Development Database Setup](#development-database-setup)
- [Running Tests Locally](#running-tests-locally)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses a comprehensive testing setup with:

- **Jest** - Testing framework with TypeScript support
- **PostgreSQL** - Separate test database for integration tests
- **GitHub Actions** - Automated CI/CD pipeline
- **Supertest** - HTTP assertion library for API testing
- **Test fixtures** - Seeded data for consistent testing

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline (GitHub Actions)          │
├─────────────────────────────────────────────────────────────┤
│  Lint → Build → Test (with PostgreSQL) → Security Audit    │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  Test Database   │
                    │  (PostgreSQL)    │
                    │   football_test  │
                    └──────────────────┘
                              ↓
                    ┌──────────────────┐
                    │  Integration     │
                    │  Tests (Jest)    │
                    └──────────────────┘
```

## Development Database Setup

### Prerequisites

1. **PostgreSQL 13+** installed locally or via Docker
2. **Node.js 18+** and npm
3. **Environment variables** configured

### Step 1: Create Test Database

Using `psql` or a PostgreSQL client:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE football_test;

# Create test user (optional)
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE football_test TO test_user;
```

**Using Docker:**

```bash
# Run PostgreSQL in Docker for testing
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=football_test \
  -p 5432:5432 \
  postgres:16
```

### Step 2: Configure Environment

Copy `.env.test` and update the database connection:

```bash
cp .env.example .env.test
```

Edit `.env.test`:

```env
# Test Database
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/football_test

# Other test configuration
NEXTAUTH_SECRET=test-secret-key-32-chars-long
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=test
```

### Step 3: Initialize Test Database

Run the setup script to create all tables:

```bash
npm run test:db:setup
```

This will:
- Drop existing tables (clean slate)
- Create all required tables with proper schema
- Set up foreign key relationships
- Create indexes for performance

### Step 4: Seed Test Data

Populate the database with sample test data:

```bash
npm run test:db:seed
```

This creates:
- 6 test users (including admin and service account)
- 5 test players (some verified, some not)
- Money records and payment statuses
- Test feedback submissions and votes
- Admin logs and banned users

## Running Tests Locally

### Install Dependencies

```bash
npm ci
```

### Run All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage reports will be generated in `coverage/` directory.

### Run Specific Test File

```bash
npm test -- __tests__/api/register.test.ts
```

### Clean Up After Tests

```bash
npm run test:db:teardown
```

## CI/CD Pipeline

The GitHub Actions CI/CD pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pipeline Stages

#### 1. **Lint & Type Check**
- Runs ESLint on all code
- Performs TypeScript type checking
- Fails if any linting errors or type errors exist

#### 2. **Build**
- Builds the Next.js application
- Verifies production build succeeds
- Uploads build artifacts for inspection

#### 3. **Integration Tests**
- Spins up PostgreSQL 16 container
- Sets up test database schema
- Seeds test data
- Runs all Jest tests
- Generates coverage reports
- Uploads coverage to Codecov (optional)
- Cleans up test database

#### 4. **Security Audit**
- Runs `npm audit` to check for vulnerabilities
- Reports on moderate and high severity issues

#### 5. **CI Summary**
- Aggregates results from all jobs
- Fails if any critical job fails
- Provides summary in GitHub Actions UI

### Viewing CI Results

1. Navigate to the **Actions** tab in GitHub
2. Click on the workflow run
3. View individual job logs
4. Check the summary for quick overview

### Required Secrets

No secrets are required for the test pipeline as it uses an ephemeral PostgreSQL container. For production deployments, configure these secrets in GitHub:

- `DATABASE_URL` - Production database connection
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- OAuth credentials (if using external auth)

## Writing Tests

### Test Structure

```
__tests__/
├── helpers/
│   └── testUtils.ts          # Shared test utilities
├── api/
│   ├── register.test.ts      # Registration endpoint tests
│   ├── users.test.ts         # Users endpoint tests
│   └── feedback.test.ts      # Feedback system tests
└── components/               # Component tests (future)
```

### Creating a New Test File

```typescript
/**
 * Integration tests for /api/your-endpoint
 */

import { createTestUser, cleanupTestData } from '../helpers/testUtils';

describe('GET /api/your-endpoint', () => {
  beforeEach(async () => {
    // Clean up before each test
    await cleanupTestData(['your_table']);
  });

  afterAll(async () => {
    // Final cleanup
    await cleanupTestData(['your_table']);
  });

  it('should return expected data', async () => {
    // Arrange - set up test data
    await createTestUser('test@example.com', 'Test User');

    // Act - call the API
    const { GET } = require('@/app/api/your-endpoint/route');
    const response = await GET(mockRequest());
    const data = await response.json();

    // Assert - verify results
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('expectedField');
  });
});
```

### Test Utilities

Use the provided test utilities in `__tests__/helpers/testUtils.ts`:

- `cleanupTestData(tables)` - Clean specific tables
- `createTestUser()` - Create a test user
- `createTestPlayer()` - Create a test player
- `createBannedUser()` - Create a banned user
- `getAllRecords(table)` - Fetch all records from a table
- `isUserBanned(userId)` - Check if user is banned
- `mockAuthenticatedSession()` - Mock NextAuth session

### Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data in `beforeEach` and `afterAll`
3. **Descriptive Names**: Use clear, descriptive test names
4. **AAA Pattern**: Arrange, Act, Assert
5. **Mock External APIs**: Don't make real API calls in tests
6. **Fast Tests**: Keep tests fast by minimizing database operations

### Running Specific Tests

```bash
# Run only register tests
npm test -- register

# Run with verbose output
npm test -- --verbose

# Update snapshots
npm test -- -u
```

## Test Coverage Goals

Current coverage thresholds (configurable in `jest.config.js`):

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

To improve coverage:

1. Run `npm run test:coverage`
2. Open `coverage/lcov-report/index.html` in browser
3. Identify uncovered code
4. Add tests for critical paths

## Troubleshooting

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env.test
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use

**Problem**: `Port 5432 already in use`

**Solution**:
```bash
# Find process using port
lsof -i :5432

# Stop existing PostgreSQL
sudo service postgresql stop

# Or use different port in .env.test
DATABASE_URL=postgresql://user:pass@localhost:5433/football_test
```

### Tests Failing in CI but Passing Locally

**Common causes**:

1. **Timezone differences**: Use UTC in tests
2. **Missing env variables**: Check GitHub Actions secrets
3. **Race conditions**: Add proper async/await
4. **Stale data**: Ensure cleanup runs properly

**Debug**:
```bash
# Run tests with same settings as CI
NODE_ENV=test npm run test:ci
```

### Mock Not Working

**Problem**: NextAuth or other mocks not applying

**Solution**:
- Check `jest.setup.js` is loaded
- Ensure mock is defined before import
- Use `jest.clearAllMocks()` between tests

### Slow Tests

**Problem**: Tests taking too long

**Solutions**:
```bash
# Run tests in parallel (default)
npm test -- --maxWorkers=4

# Run only changed tests
npm test -- --onlyChanged

# Skip expensive tests during development
npm test -- --testPathIgnorePatterns=expensive
```

## Database Maintenance

### Backup Test Data

```bash
# Create backup of test database
npm run db:backup
```

### Reset Test Database

```bash
# Complete reset
npm run test:db:teardown
npm run test:db:setup
npm run test:db:seed
```

### Inspect Test Database

```bash
# Connect to test database
psql postgresql://test_user:test_password@localhost:5432/football_test

# List tables
\dt

# View table structure
\d players

# Query data
SELECT * FROM players;
```

## Performance Tips

1. **Use transactions**: Wrap test data setup in transactions
2. **Batch operations**: Create multiple records in single query
3. **Selective cleanup**: Only clean tables used in test
4. **Connection pooling**: Reuse database connections
5. **Parallel execution**: Run independent tests in parallel

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [PostgreSQL Testing Best Practices](https://wiki.postgresql.org/wiki/Testing_best_practices)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Getting Help

If you encounter issues:

1. Check this documentation
2. Review test logs in GitHub Actions
3. Run tests locally with `--verbose` flag
4. Check database connection and schema
5. Review recent changes to test files

For questions or issues, please open a GitHub issue with:
- Description of the problem
- Steps to reproduce
- Test output/logs
- Environment details (OS, Node version, PostgreSQL version)
