# Quick Start: Testing Setup

Get your development database and testing environment up and running in 5 minutes.

## Prerequisites

- PostgreSQL 13+ installed
- Node.js 18+ installed
- Git repository cloned

## Step-by-Step Setup

### 1. Create Test Database (2 minutes)

**Option A: Using Docker (Recommended)**

```bash
docker run -d \
  --name postgres-test \
  -e POSTGRES_USER=test_user \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=football_test \
  -p 5433:5432 \
  postgres:16

# Verify it's running
docker ps | grep postgres-test
```

**Option B: Using Local PostgreSQL**

```bash
# Create database
createdb football_test

# Or using psql
psql -U postgres -c "CREATE DATABASE football_test;"
```

### 2. Configure Environment (1 minute)

```bash
# Copy test environment file
cp .env.test .env.test.local

# Edit if needed (optional)
# nano .env.test.local
```

Default configuration in `.env.test`:
```env
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/football_test
```

### 3. Install Dependencies (1 minute)

```bash
npm ci
```

### 4. Setup Database Schema (30 seconds)

```bash
npm run test:db:setup
```

You should see:
```
🧪 Setting up test database...
  → Dropping existing tables...
  → Creating users table...
  → Creating players table...
  ...
✅ Test database setup completed successfully!
```

### 5. Seed Test Data (30 seconds)

```bash
npm run test:db:seed
```

You should see:
```
🌱 Seeding test database...
  → Creating test users...
    ✅ Created 6 users
  → Creating test players...
    ✅ Created 5 players
  ...
✅ Test database seeded successfully!
```

### 6. Run Tests (1 minute)

```bash
# Run all tests
npm test

# Or run with coverage
npm run test:coverage
```

## Verify Everything Works

Run this command to verify your setup:

```bash
npm run test:db:setup && \
npm run test:db:seed && \
npm test && \
npm run test:db:teardown
```

Expected output:
```
✅ Test database setup completed successfully!
✅ Test database seeded successfully!
PASS  __tests__/api/register.test.ts
PASS  __tests__/api/users.test.ts
PASS  __tests__/api/feedback.test.ts

Test Suites: 3 passed, 3 total
Tests:       12 passed, 12 total
✅ Test database cleaned up successfully!
```

## Daily Development Workflow

### Before Starting Work

```bash
# Setup and seed database
npm run test:db:setup
npm run test:db:seed
```

### During Development

```bash
# Run tests in watch mode
npm run test:watch

# This will re-run tests when files change
```

### After Finishing Work

```bash
# Optional: Clean up test database
npm run test:db:teardown
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ci` | Run tests like CI (no colors, optimized) |
| `npm run test:db:setup` | Create/reset database schema |
| `npm run test:db:seed` | Populate with test data |
| `npm run test:db:teardown` | Clean up test database |

## Troubleshooting

### Port 5432 Already in Use

```bash
# Check what's using the port
lsof -i :5432

# Stop existing PostgreSQL
sudo service postgresql stop

# Or stop Docker container
docker stop postgres-test
```

### Database Connection Failed

```bash
# Test connection
psql postgresql://test_user:test_password@localhost:5432/football_test

# If using Docker, check container status
docker logs postgres-test
```

### Tests Failing

```bash
# Reset everything
npm run test:db:teardown
npm run test:db:setup
npm run test:db:seed

# Run tests with verbose output
npm test -- --verbose
```

## Next Steps

- Read the full [Testing and CI/CD Guide](./TESTING_AND_CI_CD.md)
- Add tests for your new features
- Set up GitHub Actions (already configured!)
- Configure coverage reporting

## Quick Reference

**Database URLs:**
- Test: `postgresql://test_user:test_password@localhost:5432/football_test`
- Production: Set in `.env` (never commit!)

**Test Files Location:**
- Tests: `__tests__/api/*.test.ts`
- Helpers: `__tests__/helpers/testUtils.ts`
- Config: `jest.config.js`

**CI/CD:**
- Workflow: `.github/workflows/ci-cd.yml`
- Runs automatically on push/PR to main/develop

---

**Need Help?** Check the [full documentation](./TESTING_AND_CI_CD.md) or open an issue.
