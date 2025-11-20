
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { auth } from '../../../../auth';

async function getAuthenticatedAdmin(req: NextRequest): Promise<{ userId: string; userName: string } | null> {
  const session = await auth();

  if (!session?.user || !session.user.isAdmin) {
    return null;
  }

  return {
    userId: session.user.id,
    userName: session.user.name || session.user.email || 'Admin'
  };
}

export async function GET(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  try {
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT id AS intra, name, reason, banned_at, banned_until, user_id
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
