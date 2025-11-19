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