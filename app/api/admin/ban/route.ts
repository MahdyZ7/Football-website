
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../lib/utils/adminAuth';
import { recordReliabilityEvent } from '../../../../lib/utils/playerHistory';
import { sendRegistrationStatusNotifications } from '../../../../lib/utils/notifications';
import {
  acquireRegistrationLock,
  reconcileRegistrationOrder,
  RegistrationStatusNotification,
} from '../../../../lib/utils/waitlist';

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { userId, reason, duration } = body;

  if (!userId || !reason || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (typeof userId !== 'string' || userId.trim().length === 0 || userId.length > 50) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const parsedDuration = Number(duration);
  if (!Number.isFinite(parsedDuration) || parsedDuration <= 0 || parsedDuration > 365) {
    return NextResponse.json({ error: 'Invalid ban duration' }, { status: 400 });
  }

  if (typeof reason !== 'string' || reason.trim().length === 0 || reason.length > 500) {
    return NextResponse.json({ error: 'Invalid ban reason' }, { status: 400 });
  }

  const client = await pool.connect();
  let statusNotifications: RegistrationStatusNotification[] = [];
  let userName = '';

  try {
    await client.query('BEGIN');
    await acquireRegistrationLock(client);

    // Check if user exists
    const userCheck = await client.query(
      'SELECT name, user_id, registration_status FROM players WHERE intra = $1 FOR UPDATE',
      [userId]
    );
    if (userCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userName = userCheck.rows[0].name;
    const bannedUntil = new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000);

    const playerUserId = userCheck.rows[0]?.user_id;

    // Insert or update ban record
    await client.query(`
      INSERT INTO banned_users (id, name, reason, banned_at, banned_until, user_id)
      VALUES ($1, $2, $3, NOW(), $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        reason = EXCLUDED.reason,
        banned_at = NOW(),
        banned_until = EXCLUDED.banned_until,
        user_id = EXCLUDED.user_id
    `, [userId, userName, reason, bannedUntil, playerUserId]);

    // Mark user as banned in current registration (preserves their spot)
    await client.query('UPDATE players SET is_banned = TRUE WHERE intra = $1', [userId]);

    statusNotifications = await reconcileRegistrationOrder(client);

    await recordReliabilityEvent(client, {
      intra: userId,
      userId: playerUserId,
      eventType: 'ban_applied',
      reason,
      relatedBanUntil: bannedUntil,
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error managing ban:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }

  try {
    await logAdminAction(
      admin.userId,
      'user_banned',
      userId,
      userName,
      `Banned for ${parsedDuration} days. Reason: ${reason}`
    );
    await sendRegistrationStatusNotifications(statusNotifications);
  } catch (postCommitError) {
    console.error('Post-commit operations failed (ban was applied):', postCommitError);
  }

  return NextResponse.json({ message: 'User banned successfully' }, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { user_id, intra } = body;

  if (!user_id && !intra) {
    return NextResponse.json({ error: 'User reference is required' }, { status: 400 });
  }

  const client = await pool.connect();
  let statusNotifications: RegistrationStatusNotification[] = [];
  let intraLogin = '';
  let userName = '';

  try {
    await client.query('BEGIN');
    await acquireRegistrationLock(client);

    // Get user info for logging
    const userResult = user_id
      ? await client.query('SELECT id, name, user_id FROM banned_users WHERE user_id = $1', [user_id])
      : await client.query('SELECT id, name, user_id FROM banned_users WHERE id = $1', [intra]);
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Ban record not found' }, { status: 404 });
    }

    intraLogin = userResult.rows[0].id;
    userName = userResult.rows[0].name;
    const resolvedUserId = userResult.rows[0].user_id || user_id || null;

    if (user_id) {
      await client.query('DELETE FROM banned_users WHERE user_id = $1', [user_id]);
      await client.query('UPDATE players SET is_banned = FALSE WHERE user_id = $1', [user_id]);
    } else {
      await client.query('DELETE FROM banned_users WHERE id = $1', [intra]);
      await client.query('UPDATE players SET is_banned = FALSE WHERE intra = $1', [intra]);
    }

    statusNotifications = await reconcileRegistrationOrder(client);

    await recordReliabilityEvent(client, {
      intra: intraLogin,
      userId: resolvedUserId,
      eventType: 'ban_removed',
      reason: 'User unbanned by admin',
    });

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error managing ban:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }

  try {
    await logAdminAction(
      admin.userId,
      'user_unbanned',
      intraLogin,
      userName,
      'User unbanned'
    );
    await sendRegistrationStatusNotifications(statusNotifications);
  } catch (postCommitError) {
    console.error('Post-commit operations failed (unban was applied):', postCommitError);
  }

  return NextResponse.json({ message: 'User unbanned successfully' }, { status: 200 });
}
