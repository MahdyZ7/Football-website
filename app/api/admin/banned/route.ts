
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

async function getAuthenticatedUser(req: NextRequest): Promise<string | null> {
  // Check for Replit authentication headers first (more reliable)
  let adminUser = req.headers.get('x-replit-user-name');

  // If no server headers, try client-side approach
  if (!adminUser) {
    try {
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const host = req.headers.get('host');
      const authUrl = `${protocol}://${host}/__replauthuser`;

      const userInfoResponse = await fetch(authUrl, {
        headers: {
          'Cookie': req.headers.get('cookie') || '',
          'User-Agent': req.headers.get('user-agent') || 'NextJS-Admin',
          'Referer': req.headers.get('referer') || `${protocol}://${host}/admin`
        }
      });

      if (!userInfoResponse.ok) {
        console.error('Auth request failed:', userInfoResponse.status);
        return null;
      }

      const userData = await userInfoResponse.json();
      adminUser = userData.name;
    } catch (fetchError) {
      console.error('Error fetching user info:', fetchError);
      return null;
    }
  }

  return adminUser;
}

export async function GET(req: NextRequest) {
  const adminUser = await getAuthenticatedUser(req);

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized - Not logged in' }, { status: 401 });
  }

  if (!ADMIN_USERS.includes(adminUser)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT id, name, reason, banned_at, banned_until
      FROM banned_users
      ORDER BY banned_at DESC
    `);
    client.release();
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching banned users:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
