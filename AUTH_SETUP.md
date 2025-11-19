# Authentication Setup Guide

This application uses NextAuth.js v5 with OAuth providers (Google, GitHub, and 42 School) for user authentication.

## Environment Variables

Add the following to your `.env` file:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000    # Change to your production URL in production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 42 School OAuth
FT_CLIENT_ID=your-42-client-id
FT_CLIENT_SECRET=your-42-client-secret
```

## OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
6. Copy Client ID and Client Secret to your `.env` file

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to your `.env` file

### 42 School OAuth
1. Go to [42 Intra Profile](https://profile.intra.42.fr/)
2. Navigate to "API" section
3. Create a new application
4. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/42-school` (development)
   - `https://yourdomain.com/api/auth/callback/42-school` (production)
5. Copy UID and SECRET to your `.env` file as `FT_CLIENT_ID` and `FT_CLIENT_SECRET`

## Database Migration

After setting up environment variables, run the database migration:

```bash
npm run db:migrate:auth
```

This will:
- Create authentication tables (users, accounts, sessions, verification_tokens)
- Add `user_id` foreign key to `players` table
- Add `user_id` foreign key to `banned_users` table
- Add `performed_by_user_id` to `admin_logs` table

## Admin Management

### Promoting Users to Admin

After users sign in for the first time, you can promote them to admin:

```bash
npm run admin:manage
```

This interactive tool allows you to:
1. List all users
2. Promote users to admin
3. Remove admin privileges
4. Exit

Alternatively, you can promote a user directly via SQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Admin Features

Admins have access to:
- Admin panel (`/admin`)
- Admin logs (`/admin-logs`)
- User management (ban, unban, delete users)
- These links only appear in the navbar for admin users

## User Registration Flow

1. Users must sign in with one of the OAuth providers
2. After signing in, they can register for matches
3. Each registration is linked to their user account
4. Users with the same email across different providers are consolidated
5. Users can remove their own registration (applies TIG-based automatic banning)

## Self-Removal and TIG Rules

When users remove their own registration, they are automatically banned according to TIG (Late/Cancellation) rules:

- **Not ready when booking time starts**: 3.5 days ban
- **Cancel reservation**: 7 days ban
- **Late > 15 minutes**: 7 days ban
- **Cancel on game day after 5 PM**: 14 days ban
- **No Show without notice**: 28 days ban

## Features

### Email Consolidation
- Users signing in with different providers (Google, GitHub, 42) but the same email are automatically linked
- All OAuth accounts are associated with a single user record

### Admin Logging
- All admin actions are logged with:
  - Admin user ID and name
  - Action type (ban, unban, delete, etc.)
  - Target user
  - Timestamp
  - Additional details

### Session Management
- Sessions are stored in the database
- 30-day session lifetime
- Automatic session refresh

## Security Considerations

1. Keep your `NEXTAUTH_SECRET` secure and never commit it to version control
2. Use HTTPS in production
3. Regularly review admin users and remove access when necessary
4. Monitor admin logs for unauthorized actions
5. Configure OAuth redirect URIs carefully to prevent attacks

## Troubleshooting

### OAuth Errors
- Verify all environment variables are set correctly
- Check that redirect URIs match exactly (including http/https)
- Ensure OAuth applications are approved/published (Google requires verification for production)

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Run `npm run db:status` to check database connectivity
- Check that the migration completed successfully

### Admin Access Issues
- Verify user has `role = 'admin'` in the users table
- Check that the user is signed in
- Clear browser cache and cookies if issues persist
