# Automatic Account Creation Feature

## Overview
The sign-in system automatically creates accounts for new users. There is no separate "Sign Up" page needed.

## How It Works

### For New Users
1. User clicks "Sign In" on the homepage or navbar
2. User is redirected to `/auth/signin`
3. User clicks on any OAuth provider (Google, GitHub, or 42 School)
4. User completes OAuth authorization with the provider
5. **NextAuth.js automatically creates a new user account** in the database
6. User is signed in and redirected back to the homepage
7. User can now register for matches

### For Existing Users
1. User clicks "Sign In"
2. Selects their OAuth provider
3. Is immediately signed in (no account creation)
4. Redirected back to homepage

### Account Consolidation
If a user signs in with different providers but **the same email address**:
- The accounts are automatically linked
- All OAuth methods work for the same user
- Example: User signs in with Google first, then later with GitHub using the same email
  - Both accounts link to the same user record
  - User can sign in with either provider

## Technical Implementation

### Database Adapter
```typescript
// auth.ts
import PostgresAdapter from "@auth/pg-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool), // Automatically handles user creation
  // ...
})
```

### Account Creation Process
When a new user signs in:

1. **OAuth Flow Completes**: Provider returns user profile
2. **Adapter Checks Database**: PostgresAdapter checks if user exists by email
3. **Account Creation** (if new):
   - Creates record in `users` table
   - Creates record in `accounts` table (links OAuth provider)
   - Creates initial session in `sessions` table
   - Sets default role to 'user'

4. **Account Linking** (if existing with same email):
   - Links new OAuth provider to existing user
   - Updates `accounts` table with new provider
   - No duplicate user created

### Database Tables

**users** table:
```sql
id, name, email, emailVerified, image, role, createdAt, updatedAt
```

**accounts** table (OAuth providers):
```sql
id, userId, type, provider, providerAccountId, access_token, etc.
```

**sessions** table:
```sql
id, sessionToken, userId, expires
```

## User Experience

### Sign-In Page UI
- **Header**: "Welcome to Football Club"
- **Subtitle**: "Sign in or create an account to register for matches"
- **Info text**: "New users will automatically have an account created"
- **Info box**: Explains first-time user flow and email consolidation

### Homepage Notice
For non-authenticated users:
- **Message**: "Please sign in to register for matches"
- **Sub-text**: "New here? An account will be created automatically when you sign in"
- **Style**: Blue info box (friendly, not warning)

## User Data Collected

From OAuth providers:
- **Name**: Full name from provider
- **Email**: Email address (required)
- **Profile Image**: Avatar from provider
- **Provider ID**: Unique ID from OAuth provider

### Google OAuth
- Name, email, profile picture
- No additional data stored

### GitHub OAuth
- Name (or username), email, avatar
- No repository or code access

### 42 School OAuth
- Intra login, usual_full_name, email, profile image
- Scope: "public" only (no private data)

## Privacy & Security

### Data Storage
- Only essential user data stored
- No passwords stored (OAuth only)
- Sessions expire after 30 days
- All data encrypted in transit (HTTPS)

### Email Consolidation Security
- Validates email ownership through OAuth provider
- Only links accounts with verified email addresses
- No manual email input (prevents spoofing)

### Role Assignment
- New users automatically assigned `role = 'user'`
- Admin promotion requires manual intervention via `npm run admin:manage`
- Role cannot be self-assigned

## Admin Management

### Promoting Users to Admin
After a user signs in for the first time:

```bash
npm run admin:manage
```

Options:
1. List all users (shows ID, name, email, role)
2. Promote user to admin (enter user ID)
3. Remove admin privileges (enter user ID)
4. Exit

Or via SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Error Handling

### OAuth Errors
Redirected to `/auth/error` page with specific error message:
- Configuration issues
- Provider authorization denial
- Account linking conflicts
- Email verification failures

### Database Errors
If account creation fails:
- User sees error message
- Can retry sign-in
- No partial account created (transaction rollback)

## Testing Scenarios

### Test New User Registration
1. Go to sign-in page
2. Click "Continue with Google" (or any provider)
3. Complete OAuth flow
4. Verify new user created in database:
   ```sql
   SELECT * FROM users WHERE email = 'test@example.com';
   SELECT * FROM accounts WHERE userId = <user_id>;
   ```
5. Verify user can register for matches

### Test Account Consolidation
1. Sign in with Google using email: test@example.com
2. Sign out
3. Sign in with GitHub using same email: test@example.com
4. Verify single user record with two accounts:
   ```sql
   SELECT u.id, u.email, COUNT(a.id) as provider_count
   FROM users u
   LEFT JOIN accounts a ON u.id = a.userId
   WHERE u.email = 'test@example.com'
   GROUP BY u.id, u.email;
   ```

### Test Session Persistence
1. Sign in
2. Close browser
3. Reopen and navigate to site
4. Verify still signed in (30-day session)

## Troubleshooting

### User Can't Sign In
- Check OAuth provider credentials in `.env`
- Verify callback URLs configured correctly
- Check database connectivity
- Review error page for specific error

### Duplicate Accounts
- Should not happen with email consolidation
- If occurs, manually merge:
  ```sql
  -- Update accounts to point to primary user
  UPDATE accounts SET userId = <primary_user_id>
  WHERE userId = <duplicate_user_id>;

  -- Delete duplicate user
  DELETE FROM users WHERE id = <duplicate_user_id>;
  ```

### Admin Not Working
- Verify role is set to 'admin' in database
- Check session is active
- Try signing out and back in

## Future Enhancements

Potential improvements:
- Email verification for providers without verified emails
- Profile editing page
- Password reset (if adding email/password auth)
- Two-factor authentication
- Account deletion option
- OAuth provider unlinking

---

**Current Status**: ✅ Fully Implemented and Working
**Version**: 1.0
**Last Updated**: 2025-11-19
