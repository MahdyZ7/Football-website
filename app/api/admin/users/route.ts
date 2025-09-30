
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';

const ADMIN_USERS = ['MahdyZ7'];

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
          'User-Agent': req.headers.get('user-agent') || 'NextJS-Admin'
        }
      });

      if (!userInfoResponse.ok) {
        return null;
      }

      const userData = await userInfoResponse.json();
      adminUser = userData.name;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  return adminUser;
}

export async function DELETE(req: NextRequest) {
  const adminUser = await getAuthenticatedUser(req);

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized - Not logged in' }, { status: 401 });
  }

  if (!ADMIN_USERS.includes(adminUser)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    const client = await pool.connect();

    // Get user info before deletion for logging
    const userResult = await client.query('SELECT name FROM players WHERE intra = $1', [id]);
    const userName = userResult.rows[0]?.name || 'Unknown';

    await client.query('DELETE FROM players WHERE intra = $1', [id]);
    client.release();

    // Log the action
    await logAdminAction({
      adminUser: adminUser,
      action: 'user_deleted',
      targetUser: id,
      targetName: userName,
      details: 'User deleted from system'
    });

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
