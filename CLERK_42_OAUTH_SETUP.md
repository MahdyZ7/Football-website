# Setting up 42 OAuth Provider in Clerk

This guide explains how to configure 42 School's OAuth provider in Clerk to enable 42 authentication for your Football Club registration system.

## Prerequisites

1. **Clerk Account**: You should already have a Clerk account and application set up
2. **42 API Application**: You need to create an OAuth application in your 42 intranet

## Step 1: Create a 42 OAuth Application

1. **Log into 42 Intranet**
   - Go to [42 Intranet](https://profile.intra.42.fr/)
   - Navigate to your profile settings

2. **Create OAuth Application**
   - Go to "Settings" → "API" → "Create a new app"
   - Fill in the application details:
     - **Name**: `Football Club Registration`
     - **Description**: `Authentication for 42 Football Club registration system`
     - **Website**: Your website URL (e.g., `https://your-app.vercel.app`)
     - **Redirect URI**: `https://your-clerk-frontend-api/v1/oauth_callback` 
       - Replace `your-clerk-frontend-api` with your actual Clerk Frontend API URL
       - You can find this in your Clerk Dashboard under "API Keys"
       - Example: `https://clerk.example.com/v1/oauth_callback`

3. **Save the Credentials**
   - Copy the **Client ID** (UID)
   - Copy the **Client Secret** (SECRET)
   - Keep these secure - you'll need them for Clerk configuration

## Step 2: Configure 42 OAuth in Clerk

1. **Access Clerk Dashboard**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Select your application

2. **Navigate to Social Connections**
   - In the left sidebar, go to **"User & Authentication"** → **"Social Connections"**

3. **Add Custom OAuth Provider**
   - Click **"Add connection"**
   - Select **"Custom OAuth"** or look for **"42"** if available
   - If 42 is not listed, use **"Custom OAuth"** with these settings:

## Step 3: Custom OAuth Configuration

If using Custom OAuth, configure with these 42-specific settings:

```json
{
  "provider": "oauth_42",
  "name": "42 School",
  "key": "YOUR_42_CLIENT_ID",
  "secret": "YOUR_42_CLIENT_SECRET",
  "authorize_url": "https://api.intra.42.fr/oauth/authorize",
  "token_url": "https://api.intra.42.fr/oauth/token",
  "userinfo_url": "https://api.intra.42.fr/v2/me",
  "scope": "public",
  "strategy": "oauth2"
}
```

### Configuration Details:

- **Provider Key**: `oauth_42` (or custom name)
- **Name**: `42 School`
- **Client ID**: Your 42 OAuth Client ID
- **Client Secret**: Your 42 OAuth Client Secret
- **Authorization URL**: `https://api.intra.42.fr/oauth/authorize`
- **Token URL**: `https://api.intra.42.fr/oauth/token`
- **User Info URL**: `https://api.intra.42.fr/v2/me`
- **Scopes**: `public`

## Step 4: User Data Mapping

Configure how 42 user data maps to Clerk user attributes:

```json
{
  "id": "id",
  "email": "email",
  "first_name": "first_name",
  "last_name": "last_name",
  "username": "login",
  "image_url": "image.versions.medium",
  "provider_user_id": "id"
}
```

## Step 5: Update Redirect URIs

1. **Get Clerk Callback URL**
   - In Clerk Dashboard, note the OAuth callback URL
   - Format: `https://[YOUR_CLERK_FRONTEND_API]/v1/oauth_callback`

2. **Update 42 Application**
   - Go back to your 42 OAuth application settings
   - Add the Clerk callback URL to **Redirect URIs**
   - Save the changes

## Step 6: Test the Integration

1. **Update Your Sign-In Component**
   - The existing Clerk `SignInButton` should automatically show 42 as an option
   - Users will see "Sign in with 42" button

2. **Test Authentication Flow**
   - Try signing in with a 42 account
   - Verify that user data is correctly imported
   - Check that the user can access the registration system

## Step 7: Optional Customization

### Custom Button Styling
You can customize the 42 sign-in button appearance:

```tsx
import { SignInButton } from '@clerk/nextjs';

<SignInButton mode="modal">
  <button className="42-signin-button">
    <img src="/42-logo.png" alt="42" />
    Sign in with 42
  </button>
</SignInButton>
```

### Restrict to 42 Users Only
To only allow 42 users to register:

```tsx
import { SignInButton } from '@clerk/nextjs';

<SignInButton 
  mode="modal"
  redirectUrl="/registration"
  forceRedirectUrl="/registration"
>
  <button>Sign in with 42 School</button>
</SignInButton>
```

## Troubleshooting

### Common Issues:

1. **Invalid Redirect URI**
   - Ensure the redirect URI in 42 exactly matches Clerk's callback URL
   - Check for trailing slashes or protocol mismatches

2. **Scope Issues**
   - Start with `public` scope
   - Add additional scopes if you need more user data

3. **User Data Not Mapping**
   - Check the user data structure returned by 42 API
   - Adjust the mapping configuration accordingly

4. **Authentication Fails**
   - Verify Client ID and Secret are correct
   - Check that your 42 application is active
   - Ensure redirect URIs are properly configured

### Testing Endpoints:

- **42 API Test**: `https://api.intra.42.fr/v2/me` (requires valid token)
- **Clerk Webhooks**: Set up webhooks to debug user creation issues

## Additional Resources

- [Clerk Custom OAuth Documentation](https://clerk.com/docs/authentication/social-connections/custom-provider)
- [42 API Documentation](https://api.intra.42.fr/apidoc)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)

## Security Notes

- Keep your 42 Client Secret secure and never expose it in client-side code
- Use environment variables for sensitive configuration
- Regularly rotate OAuth credentials
- Monitor authentication logs for suspicious activity

---

After completing this setup, users will be able to sign in using their 42 School accounts, and their 42 login information will be available for verification against your existing intra validation system.