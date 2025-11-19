
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { auth } from '../../../../auth';

async function getAuthenticatedAdmin(req: NextRequest): Promise<{ userId: number; userName: string } | null> {
  const session = await auth();

  if (!session?.user || !session.user.isAdmin) {
    return null;
  }

  return {
    userId: parseInt(session.user.id),
    userName: session.user.name || session.user.email || 'Admin'
  };
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
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

    // Get the user_id from players table if exists
    const playerUserIdResult = await client.query('SELECT user_id FROM players WHERE intra = $1', [userId]);
    const playerUserId = playerUserIdResult.rows[0]?.user_id;

    // Insert or update ban record
    await client.query(`
      INSERT INTO banned_users (id, name, reason, banned_at, banned_until, user_id)
      VALUES ($1, $2, $3, NOW(), $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET reason = $2, banned_at = NOW(), banned_until = $4, user_id = $5
    `, [userId, userName, reason, bannedUntil, playerUserId]);

    // Log the action
    await logAdminAction(
      admin.userId,
      'user_banned',
      userId,
      userName,
      `Banned for ${duration} days. Reason: ${reason}`
    );

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
  const admin = await getAuthenticatedAdmin(req);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  const client = await pool.connect();

  try {
    const { user_id } = await req.json();

    // Get user info for logging
    const userResult = await client.query('SELECT id, name FROM banned_users WHERE user_id = $1', [user_id]);
    const intraLogin = userResult.rows[0]?.id || 'Unknown';
    const userName = userResult.rows[0]?.name || 'Unknown';

    await client.query('DELETE FROM banned_users WHERE user_id = $1', [user_id]);

    // Log the action
    await logAdminAction(
      admin.userId,
      'user_unbanned',
      intraLogin,
      userName,
      'User unbanned'
    );

    return NextResponse.json({ message: 'User unbanned successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error managing ban:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
