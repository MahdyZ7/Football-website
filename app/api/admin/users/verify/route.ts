import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/utils/db';
import { logAdminAction } from '../../../../../lib/utils/adminLogger';
import { getAuthenticatedAdmin } from '../../../../../lib/utils/adminAuth';

export async function PATCH(req: NextRequest) {
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

  const { id, verified } = body;
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }
  if (typeof verified !== 'boolean') {
    return NextResponse.json({ error: 'Verified must be a boolean' }, { status: 400 });
  }

  const client = await pool.connect();
  let userName = 'Unknown';

  try {
    await client.query('BEGIN');

    const userResult = await client.query(
      'SELECT name FROM players WHERE intra = $1 FOR UPDATE',
      [id]
    );
    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userName = userResult.rows[0]?.name || 'Unknown';

    await client.query('UPDATE players SET verified = $1 WHERE intra = $2', [verified, id]);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }

  // Post-commit logging (non-critical)
  try {
    await logAdminAction(
      admin.userId,
      verified ? 'user_verified' : 'user_unverified',
      id,
      userName,
      `User verification status changed to: ${verified ? 'verified' : 'unverified'}`
    );
  } catch (logError) {
    console.error('Failed to log admin action (verification was updated):', logError);
  }

  return NextResponse.json({ message: 'User verification updated' }, { status: 200 });
}
