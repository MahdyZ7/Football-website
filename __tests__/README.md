# Test Suite

This directory contains integration tests for the Football Club Registration website.

## Directory Structure

```
__tests__/
├── README.md                 # This file
├── helpers/
│   └── testUtils.ts         # Shared test utilities and helper functions
└── api/
    ├── register.test.ts     # Tests for /api/register endpoint
    ├── users.test.ts        # Tests for /api/users endpoint
    └── feedback.test.ts     # Tests for /api/feedback endpoints
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- register

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Writing New Tests

1. Create a new test file in the appropriate directory
2. Import test utilities from `helpers/testUtils.ts`
3. Set up `beforeEach` and `afterAll` hooks for cleanup
4. Write descriptive test cases using Jest syntax
5. Follow the AAA pattern (Arrange, Act, Assert)

Example:

```typescript
import { createTestUser, cleanupTestData } from '../helpers/testUtils';

describe('GET /api/my-endpoint', () => {
  beforeEach(async () => {
    await cleanupTestData(['my_table']);
  });

  afterAll(async () => {
    await cleanupTestData(['my_table']);
  });

  it('should return expected data', async () => {
    // Arrange
    const user = await createTestUser('test@example.com', 'Test User');

    // Act
    const { GET } = require('@/app/api/my-endpoint/route');
    const response = await GET(mockRequest());
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('expectedField');
  });
});
```

## Test Utilities

Available in `helpers/testUtils.ts`:

- `getTestPool()` - Get PostgreSQL connection pool
- `cleanupTestData(tables)` - Clean up test data
- `createTestUser(email, name, isAdmin?, userId?)` - Create test user
- `createTestPlayer(intra, name, verified?, userId?)` - Create test player
- `createBannedUser(id, name, reason, durationDays?)` - Create banned user
- `getAllRecords(tableName)` - Fetch all records from table
- `isUserBanned(userId)` - Check if user is banned
- `mockAuthenticatedSession(userId, isAdmin?)` - Mock NextAuth session

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data to avoid interference
3. **Descriptive Names**: Use clear, descriptive test names that explain what's being tested
4. **Fast**: Keep tests fast by minimizing database operations
5. **Mock External APIs**: Don't make real external API calls
6. **Assertions**: Use specific assertions (prefer `toBe(200)` over `toBeTruthy()`)

## Test Coverage

Check coverage reports:

```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## Adding Tests for New Features

When adding a new API endpoint or feature:

1. Create a corresponding test file
2. Test successful cases
3. Test error cases (validation, authorization, etc.)
4. Test edge cases
5. Ensure cleanup runs properly

## Debugging Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run single test
npm test -- -t "should register a new user"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to main/develop
- Pull requests to main/develop

The CI pipeline:
1. Sets up PostgreSQL container
2. Runs database setup scripts
3. Seeds test data
4. Executes all tests
5. Generates coverage reports
6. Cleans up

See `.github/workflows/ci-cd.yml` for configuration.

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](../../docs/TESTING_AND_CI_CD.md)
- [Quick Start Guide](../../docs/QUICK_START_TESTING.md)
