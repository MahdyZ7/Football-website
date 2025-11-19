# Service Account Setup Guide

This guide explains how to set up and use the service account for automated tasks like scheduled player list resets.

## Overview

The service account system replaces the old `resetuser` secret with a more secure API key authentication method that:
- ✅ Provides full audit trail (all actions are logged)
- ✅ Uses proper database user accounts instead of shared secrets
- ✅ Allows key rotation without code changes
- ✅ Follows security best practices

---

## Initial Setup

### Step 1: Create the Service Account

Run the setup script to create a service account user and generate an API key:

```bash
npm run service:setup
```

This will:
1. Create a special user account with `role='service'` in your database
2. Generate a secure 64-character API key
3. Display the API key (only shown once!)
4. Show you the environment variables to add

**Example output:**
```
🔧 Setting up service account for automated tasks...

✅ Service account created:
   ID: 5
   Email: service@system.local
   Role: service

🔑 Generated API Key (save this securely!):

────────────────────────────────────────────────────────────────────────────────
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
────────────────────────────────────────────────────────────────────────────────

📝 Add these to your .env file:

SERVICE_ACCOUNT_USER_ID=5
SERVICE_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

⚠️  IMPORTANT: This API key will only be shown once!
   Copy it now and store it securely in your environment variables.
```

### Step 2: Add to Environment Variables

Add the generated values to your `.env` file:

```bash
# Service Account for Automated Tasks
SERVICE_ACCOUNT_USER_ID=5
SERVICE_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### Step 3: Update Your Cron Job

Update your cron job to use the new API key authentication.

---

## Cron Job Setup

### Option A: Using curl

Replace your old cron job with:

```bash
# Reset player list twice a week (example: Sunday and Wednesday at 8 PM)
0 20 * * 0,3 curl -X DELETE https://your-domain.com/api/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_SERVICE_API_KEY_HERE" \
  -d '{}' \
  >> /var/log/football-reset.log 2>&1
```

### Option B: Using a Script

Create a script file (e.g., `reset-players.sh`):

```bash
#!/bin/bash

API_KEY="your-service-api-key-here"
API_URL="https://your-domain.com/api/register"
LOG_FILE="/var/log/football-reset.log"

echo "$(date): Starting player list reset..." >> "$LOG_FILE"

response=$(curl -s -X DELETE "$API_URL" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $API_KEY" \
  -d '{}')

if echo "$response" | grep -q '"success":true'; then
  echo "$(date): ✅ Player list reset successful" >> "$LOG_FILE"
else
  echo "$(date): ❌ Player list reset failed: $response" >> "$LOG_FILE"
fi
```

Make it executable:
```bash
chmod +x reset-players.sh
```

Add to crontab:
```bash
# Reset player list twice a week
0 20 * * 0,3 /path/to/reset-players.sh
```

### Option C: Using GitHub Actions

Create `.github/workflows/reset-players.yml`:

```yaml
name: Reset Player List

on:
  schedule:
    # Runs at 8 PM UTC on Sunday and Wednesday
    - cron: '0 20 * * 0,3'
  workflow_dispatch: # Allows manual trigger

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Reset Player List
        run: |
          curl -X DELETE ${{ secrets.API_URL }}/api/register \
            -H "Content-Type: application/json" \
            -H "x-api-key: ${{ secrets.SERVICE_API_KEY }}" \
            -d '{}'
```

Then add secrets in GitHub:
- `API_URL`: Your website URL
- `SERVICE_API_KEY`: Your service API key

### Option D: Using Vercel Cron Jobs

If deployed on Vercel, create an API route for the cron job:

1. Create `app/api/cron/reset-players/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Verify this is from Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Call your internal DELETE endpoint
  const apiKey = process.env.SERVICE_API_KEY;
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/register`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey!,
    },
    body: JSON.stringify({}),
  });

  const result = await response.json();
  return NextResponse.json(result);
}
```

2. Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/reset-players",
    "schedule": "0 20 * * 0,3"
  }]
}
```

---

## Testing

Test the new authentication locally:

```bash
# Test with correct API key (should succeed)
curl -X DELETE http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{}'

# Test with wrong API key (should fail)
curl -X DELETE http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -H "x-api-key: wrong-key" \
  -d '{}'

# Test without API key (should fail)
curl -X DELETE http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Verification

After setup, verify everything works:

1. **Check the service account exists:**
   ```bash
   npm run admin:manage
   # Select option 1 to list all users
   # You should see "service@system.local" with role="service"
   ```

2. **Check admin logs:**
   Visit `/admin-logs` in your application after running a reset
   You should see entries like:
   - Action: `scheduled_list_reset`
   - Admin User: `System Service Account`
   - Details: `Automated weekly player list reset`

3. **Test the cron job:**
   Run your cron job manually to ensure it works before scheduling

---

## Security Best Practices

### ✅ DO:
- Store the API key in environment variables only
- Use different API keys for development and production
- Rotate the API key periodically (every 90 days)
- Monitor the admin logs for unauthorized attempts
- Keep the API key secret (don't commit to git)

### ❌ DON'T:
- Share the API key via email, Slack, or chat
- Hardcode the API key in scripts
- Use the same key across multiple environments
- Log the API key in your application logs
- Store the API key in plaintext files

---

## Rotating the API Key

To generate a new API key:

1. Run the setup script again:
   ```bash
   npm run service:setup
   ```

2. It will detect the existing service account and only generate a new key

3. Update the key in:
   - Your `.env` file
   - Your cron job configuration
   - Any other services using the key

4. Test that everything still works

---

## Troubleshooting

### Error: "Unauthorized - Invalid API key"

**Cause:** The API key is missing or incorrect

**Solution:**
1. Check that `SERVICE_API_KEY` is set in your `.env` file
2. Verify the cron job is using the correct key
3. Ensure there are no extra spaces or quotes around the key

### Error: "Service account not configured"

**Cause:** `SERVICE_ACCOUNT_USER_ID` is not set

**Solution:**
1. Run `npm run service:setup` to create the service account
2. Add `SERVICE_ACCOUNT_USER_ID` to your `.env` file

### Cron job not running

**Solution:**
1. Check cron job logs: `tail -f /var/log/football-reset.log`
2. Verify the cron schedule is correct
3. Test the curl command manually first
4. Check server time zone matches your expected schedule

### Actions not appearing in admin logs

**Cause:** The service account user ID might be incorrect

**Solution:**
1. Run `npm run admin:manage` and check the service account ID
2. Update `SERVICE_ACCOUNT_USER_ID` in your `.env` file
3. Restart your application

---

## Migration from Old System

If you're migrating from the old `resetuser` secret system:

1. **Set up the new service account** (follow steps above)
2. **Update your cron job** to use the new API key
3. **Test thoroughly** in a staging environment
4. **Deploy to production**
5. **Keep the old `resetuser` secret** for one week as a backup
6. **Remove the old secret** after confirming everything works

The old system will continue to work during the transition period, but you should migrate as soon as possible for better security.

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the admin logs at `/admin-logs`
3. Check your server/application logs
4. Verify environment variables are set correctly
