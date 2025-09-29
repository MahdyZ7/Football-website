
import { NextResponse } from 'next/server';
import pool from '../../../lib/utils/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const { rows } = await client.query(`
      SELECT
        id,
        admin_user,
        action,
        target_user,
        target_name,
        details,
        timestamp
      FROM admin_logs
      ORDER BY timestamp DESC
      LIMIT 100
    `);
    client.release();
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
