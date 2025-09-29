
import { NextResponse } from 'next/server';
import pool from '../../../lib/utils/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT id, name, reason, banned_at, banned_until
      FROM banned_users
      ORDER BY banned_until DESC, banned_at DESC
    `);
    client.release();
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching banned users:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
