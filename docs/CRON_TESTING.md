# Cron Job Testing Guide

This guide explains how to test Vercel cron jobs locally before deployment.

## Prerequisites

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Ensure environment variables are set in `.env`:**
   - `CRON_SECRET` - Authentication secret for cron endpoint
   - `SERVICE_API_KEY` - API key for service account
   - `NEXTAUTH_URL` - Your local server URL (default: http://localhost:3000)

## Testing Methods

### Method 1: Using npm script (Recommended)

```bash
npm run test:cron
```

This runs the TypeScript test script with better error handling and JSON formatting.

### Method 2: Using bash script

```bash
bash scripts/test-cron.sh
```

Alternative bash-based test script.

### Method 3: Manual curl command

```bash
curl -X GET http://localhost:3001/api/cron/reset-players \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -v
```

Replace `YOUR_CRON_SECRET` with the value from your `.env` file.

### Method 4: Using a REST client

**Postman / Insomnia:**
- Method: `GET`
- URL: `http://localhost:3001/api/cron/reset-players`
- Headers:
  - `Authorization: Bearer YOUR_CRON_SECRET`
  - `Content-Type: application/json`

## Expected Response

**Success (200):**
```json
{
  "message": "All players have been deleted successfully",
  "count": 5
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized"
}
```

## Troubleshooting

### "Server is not responding"
- Make sure your dev server is running: `npm run dev`
- Check that `NEXTAUTH_URL` in `.env` matches your dev server port

### "Unauthorized" error
- Verify `CRON_SECRET` is set in `.env`
- Check that the Authorization header matches exactly: `Bearer YOUR_CRON_SECRET`

### "SERVICE_API_KEY not set"
- Run `npm run service:setup` to create the service account and generate API key
- Add the generated `SERVICE_API_KEY` to your `.env` file

## Deployment to Vercel

1. **Add environment variable in Vercel:**
   - Go to your project settings → Environment Variables
   - Add `CRON_SECRET` with the same value from your local `.env`
   - Add `SERVICE_API_KEY` with the same value from your local `.env`

2. **Cron schedule:**
   The cron job is configured in `vercel.json`:
   ```json
   {
     "crons": [{
       "path": "/api/cron/reset-players",
       "schedule": "0 6 * * 0,3"
     }]
   }
   ```
   This runs at **6 AM UTC on Sundays and Wednesdays**.

3. **Vercel automatically adds the Authorization header** when triggering cron jobs, so no additional configuration is needed.

## What the Cron Job Does

The `reset-players` cron job:
1. Verifies the request is authenticated with `CRON_SECRET`
2. Calls the `DELETE /api/register` endpoint with `SERVICE_API_KEY`
3. Deletes all players from the registration list
4. Logs the action to `admin_logs` table with service account attribution
