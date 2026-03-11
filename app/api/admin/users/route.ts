
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../lib/utils/adminAuth';
import { sendRegistrationStatusNotifications } from '../../../../lib/utils/notifications';
import {
  acquireRegistrationLock,
  reconcileRegistrationOrder,
  RegistrationStatusNotification,
} from '../../../../lib/utils/waitlist';

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

  const { id } = body;

  if (!id || typeof id !== 'string' || id.trim().length === 0 || id.length > 50) {
    return NextResponse.json({ error: 'Valid user ID is required' }, { status: 400 });
  }

  const client = await pool.connect();
  let statusNotifications: RegistrationStatusNotification[] = [];
  let userName = '';

  try {
    await client.query('BEGIN');
    await acquireRegistrationLock(client);

    const userResult = await client.query(
      'SELECT name FROM players WHERE intra = $1 FOR UPDATE',
      [id]
    );
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userName = userResult.rows[0].name;

    await client.query('DELETE FROM players WHERE intra = $1', [id]);
    statusNotifications = await reconcileRegistrationOrder(client);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }

  // Post-commit logging and notifications (non-critical)
  try {
    await logAdminAction(
      admin.userId,
      'user_deleted',
      id,
      userName,
      'User deleted from system'
    );
    await sendRegistrationStatusNotifications(statusNotifications);
  } catch (postCommitError) {
    console.error('Post-commit operations failed (user was deleted):', postCommitError);
  }

  return NextResponse.json({ message: 'User deleted' }, { status: 200 });
}
