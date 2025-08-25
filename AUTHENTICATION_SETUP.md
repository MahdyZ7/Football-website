# Authentication Setup Guide

This guide explains how to set up each OAuth provider for both development and production environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [NextAuth.js Configuration](#nextauthjs-configuration)
- [Google OAuth Setup](#google-oauth-setup)
- [GitHub OAuth Setup](#github-oauth-setup)
- [42 School OAuth Setup](#42-school-oauth-setup)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Admin Role Assignment](#admin-role-assignment)
- [Testing](#testing)

## Prerequisites

1. Node.js and npm installed
2. PostgreSQL database running
3. Domain or localhost for callback URLs

## NextAuth.js Configuration

### Development
- **NEXTAUTH_URL**: `http://localhost:3001`
- **NEXTAUTH_SECRET**: Generate a random string (32+ characters)
  ```bash
  # Generate a secure secret
  openssl rand -base64 32
  ```

### Production
- **NEXTAUTH_URL**: Your production domain (e.g., `https://yourdomain.com`)
- **NEXTAUTH_SECRET**: Use a different, secure secret for production

## Google OAuth Setup

### 1. Google Cloud Console Setup

#### Development & Production:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Google+ API" or "People API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - Application name: "Football Club Registration"
   - Authorized domains: Add your domain(s)
   - Scopes: `email`, `profile`, `openid`

#### Authorized Redirect URIs:
- **Development**: `http://localhost:3001/api/auth/callback/google`
- **Production**: `https://yourdomain.com/api/auth/callback/google`

### 2. Environment Variables
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Testing
- Users can sign in with any Google account
- Email addresses in the `admin_list` table will get admin roles

## GitHub OAuth Setup

### 1. GitHub OAuth App Setup

#### Development:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in details:
   - **Application name**: "Football Club Registration (Dev)"
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001/api/auth/callback/github`

#### Production:
1. Create another OAuth App for production:
   - **Application name**: "Football Club Registration"
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://yourdomain.com/api/auth/callback/github`

### 2. Environment Variables
```env
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### 3. Testing
- Users can sign in with their GitHub accounts
- The primary email from GitHub will be used for role assignment

## 42 School OAuth Setup

### 1. 42 Intranet API Setup

#### Development & Production:
1. Go to [42 Intranet API](https://api.intra.42.fr/apidoc)
2. Log in with your 42 account
3. Create a new application:
   - **Name**: "Football Club Registration"
   - **Description**: "Registration system for 42 football club"

#### Redirect URIs:
- **Development**: `http://localhost:3001/api/auth/callback/42-school`
- **Production**: `https://yourdomain.com/api/auth/callback/42-school`

### 2. Scopes
- `public` (default scope for basic user information)

### 3. Environment Variables
```env
FORTY_TWO_CLIENT_ID=your-42-client-id
FORTY_TWO_CLIENT_SECRET=your-42-client-secret
```

### 4. Testing
- Only users with 42 accounts can sign in through this provider
- Uses the 42 intranet email for role assignment

## Database Setup

### 1. Run Database Migration
```bash
npm run db:migrate
```

This creates the required NextAuth.js tables and triggers.

### 2. Required Tables
The migration creates:
- `users` - NextAuth user data
- `accounts` - OAuth account linking
- `sessions` - User sessions
- `verification_tokens` - Email verification
- `admin_list` - Admin email addresses

## Environment Variables

### Complete .env file:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/football_club

# NextAuth.js
NEXTAUTH_URL=http://localhost:3001  # Change for production
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# 42 School OAuth
FORTY_TWO_CLIENT_ID=your-42-client-id
FORTY_TWO_CLIENT_SECRET=your-42-client-secret

# Reset functionality (existing)
resetuser=your-reset-secret
```

### Security Notes:
- Never commit real credentials to version control
- Use different secrets for development and production
- Store production credentials in secure environment variables

## Admin Role Assignment

### 1. Add Admin Emails to Database
```sql
INSERT INTO admin_list (admin_email) VALUES 
('admin1@example.com'),
('admin2@42student.fr'),
('admin3@gmail.com');
```

### 2. Automatic Role Assignment
- Users signing in with emails in `admin_list` automatically get admin role
- All other users get user role by default
- Roles are assigned via database trigger on user creation/update

## Testing

### 1. Development Testing
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Navigate to `http://localhost:3001`
3. Click "Sign In" and test each provider
4. Check that roles are assigned correctly

### 2. Production Testing
1. Deploy your application
2. Test each OAuth provider
3. Verify SSL certificates are working
4. Check admin functionality with admin accounts

### 3. Troubleshooting

#### Common Issues:
- **Invalid redirect URI**: Check that callback URLs match exactly
- **Scope errors**: Ensure required scopes are enabled
- **Database connection**: Verify DATABASE_URL is correct
- **Missing admin access**: Check if email is in `admin_list` table

#### Debug Mode:
Enable NextAuth.js debug mode in development:
```env
NEXTAUTH_DEBUG=true
```

## Security Best Practices

1. **Use HTTPS in production**
2. **Rotate secrets regularly**
3. **Monitor OAuth app usage**
4. **Implement rate limiting**
5. **Keep dependencies updated**
6. **Use environment-specific configurations**

## Provider-Specific Notes

### Google
- Requires OAuth consent screen configuration
- May require verification for production use
- Supports refresh tokens

### GitHub
- Works with both personal and organization accounts
- Primary email is used for authentication
- No additional verification required

### 42 School
- Limited to 42 network users
- Custom provider implementation
- May have API rate limits

## Account Linking

### How Account Linking Works

The application automatically links accounts when users sign in with different OAuth providers using the same email address.

### Example Scenario:
1. User signs in with Google using `user@example.com`
2. Later, user signs in with GitHub using the same `user@example.com`
3. The accounts are automatically linked - user can sign in with either provider
4. User profile shows both linked accounts

### Configuration:
Account linking is enabled through:
- `allowDangerousEmailAccountLinking: true` in provider configuration
- Database adapter handles the linking automatically
- Custom `signIn` callback validates the process

### Security Considerations:
- **Email verification**: Ensure email addresses are verified by providers
- **HTTPS required**: Account linking should only be used over HTTPS in production
- **Trusted providers**: Only enable linking with trusted OAuth providers

### Viewing Linked Accounts:
Users can see their linked accounts on the profile page at `/profile`

## Support

For issues with specific providers:
- **Google**: [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- **GitHub**: [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- **42 School**: [42 API Documentation](https://api.intra.42.fr/apidoc)
- **NextAuth.js**: [NextAuth.js Documentation](https://next-auth.js.org/)