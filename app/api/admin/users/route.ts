
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

export async function DELETE(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
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
    await logAdminAction(
      admin.userId,
      'user_deleted',
      id,
      userName,
      'User deleted from system'
    );

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
