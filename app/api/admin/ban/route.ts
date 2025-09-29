
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';

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

export async function POST(req: NextRequest) {
  const adminUser = await getAuthenticatedUser(req);

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized - Not logged in' }, { status: 401 });
  }

  if (!ADMIN_USERS.includes(adminUser)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const client = await pool.connect();

  try {
    const { userId, reason, duration } = await req.json();

    if (!userId || !reason || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const userCheck = await client.query('SELECT name FROM players WHERE intra = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = userCheck.rows[0].name;
    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + parseFloat(duration));

    // Insert or update ban record
    await client.query(`
      INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
      VALUES ($1, $2, $3, NOW(), $4)
      ON CONFLICT (id)
      DO UPDATE SET reason = $2, banned_at = NOW(), banned_until = $4
    `, [userId, userName, reason, bannedUntil]);

    // Log the action
    await logAdminAction({
      adminUser: adminUser,
      action: 'user_banned',
      targetUser: userId,
      targetName: userName,
      details: `Banned for ${duration} days. Reason: ${reason}`
    });

    // Remove user from current registration if they exist
    await client.query('DELETE FROM players WHERE intra = $1', [userId]);

    return NextResponse.json({ message: 'User banned successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error managing ban:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest) {
  const adminUser = await getAuthenticatedUser(req);

  if (!adminUser) {
    return NextResponse.json({ error: 'Unauthorized - Not logged in' }, { status: 401 });
  }

  if (!ADMIN_USERS.includes(adminUser)) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const client = await pool.connect();

  try {
    const { id } = await req.json();

    // Get user name for logging
    const userResult = await client.query('SELECT name FROM banned_users WHERE id = $1', [id]);
    const userName = userResult.rows[0]?.name || 'Unknown';

    await client.query('DELETE FROM banned_users WHERE id = $1', [id]);

    // Log the action
    await logAdminAction({
      adminUser: adminUser,
      action: 'user_unbanned',
      targetUser: id,
      targetName: userName,
      details: 'User unbanned'
    });

    return NextResponse.json({ message: 'User unbanned successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error managing ban:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
