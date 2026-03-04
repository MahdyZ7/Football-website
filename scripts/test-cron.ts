#!/usr/bin/env tsx

/**
 * Test script for Vercel cron job local testing
 * Usage: tsx scripts/test-cron.ts
 */

import 'dotenv/config';

async function testCronJob() {
  console.log('🧪 Testing Vercel Cron Job Locally');
  console.log('==================================\n');

  // Check environment variables
  const CRON_SECRET = process.env.CRON_SECRET;
  const SERVICE_API_KEY = process.env.SERVICE_API_KEY;
  const NEXTAUTH_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  if (!CRON_SECRET) {
    console.error('❌ Error: CRON_SECRET is not set in .env file');
    console.error('   Add this line to your .env file:');
    console.error('   CRON_SECRET=<your-secret>');
    process.exit(1);
  }

  if (!SERVICE_API_KEY) {
    console.error('❌ Error: SERVICE_API_KEY is not set in .env file');
    console.error('   Run: npm run service:setup');
    process.exit(1);
  }

  console.log(`✅ Environment variables loaded`);
  console.log(`📡 Target URL: ${NEXTAUTH_URL}/api/cron/reset-players`);
  console.log(`🔑 Using CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...\n`);

  // Check if server is running
  console.log('🔍 Checking if dev server is running...');
  try {
    await fetch(NEXTAUTH_URL, {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    });
    console.log('✅ Server is running\n');
  } catch {
    console.error(`❌ Server is not responding at ${NEXTAUTH_URL}`);
    console.error('\n   Please start your dev server first:');
    console.error('   npm run dev\n');
    process.exit(1);
  }

  // Make the cron request
  console.log('🚀 Calling cron endpoint...');
  console.log('==================================\n');

  try {
    const response = await fetch(`${NEXTAUTH_URL}/api/cron/reset-players`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.json();

    console.log(`HTTP Status: ${response.status} ${response.statusText}`);
    console.log('\nResponse Body:');
    console.log(JSON.stringify(body, null, 2));
    console.log('\n==================================');

    if (response.ok) {
      console.log('✅ Cron job executed successfully!');
      process.exit(0);
    } else if (response.status === 401) {
      console.error('❌ Unauthorized - Check your CRON_SECRET');
      console.error(`   Expected: Bearer ${CRON_SECRET.substring(0, 10)}...`);
      process.exit(1);
    } else {
      console.warn(`⚠️  Request completed with status: ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error making request:', error);
    process.exit(1);
  }
}

testCronJob();
