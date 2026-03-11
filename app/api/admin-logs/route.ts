
import { NextResponse } from 'next/server';
import pool from '../../../lib/utils/db';
import { getAuthenticatedAdmin } from '../../../lib/utils/adminAuth';

function sanitizeText(value: string | null | undefined): string | null {
  if (!value) return null;

  return value
    .replace(/[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}/g, '[redacted-id]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]');
}

function sanitizeName(value: string | null | undefined): string {
  if (!value) return 'Unknown';
  const sanitized = sanitizeText(value) ?? 'Unknown';
  return sanitized.replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
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
    return NextResponse.json(
      rows.map((row) => ({
        id: row.id,
        admin_user: sanitizeName(row.admin_user),
        action: sanitizeText(row.action) ?? '',
        target_user: sanitizeText(row.target_user),
        target_name: sanitizeName(row.target_name),
        details: sanitizeText(row.details),
        timestamp: row.timestamp,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
