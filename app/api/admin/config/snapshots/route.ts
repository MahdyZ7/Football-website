import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/utils/db';
import { auth } from '../../../../../auth';
import { logAdminAction } from '../../../../../lib/utils/adminLogger';
import { invalidateConfigCache } from '../../../../../lib/config/server';

async function getAuthenticatedAdmin(): Promise<{ userId: string; userName: string } | null> {
  const session = await auth();
  if (!session?.user || !session.user.isAdmin) return null;
  return {
    userId: session.user.id,
    userName: session.user.name || session.user.email || 'Admin',
  };
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.description, s.config_version, s.is_auto, s.created_at,
             u.name as created_by_name
      FROM site_config_snapshots s
      LEFT JOIN users u ON s.created_by_user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ snapshots: result.rows });
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  const body = await req.json();

  if (body.action === 'restore') {
    return handleRestore(body.snapshotId, admin);
  }

  return handleCreateSnapshot(body, admin);
}

async function handleCreateSnapshot(
  body: { name?: string; description?: string },
  admin: { userId: string; userName: string }
) {
  const { name, description } = body;
  if (!name || name.trim().length === 0) {
    return NextResponse.json({ error: 'Snapshot name is required' }, { status: 400 });
  }

  try {
    const current = await pool.query('SELECT config, version FROM site_config WHERE id = 1');
    if (current.rows.length === 0) {
      return NextResponse.json({ error: 'Config not initialized' }, { status: 500 });
    }

    const result = await pool.query(
      `INSERT INTO site_config_snapshots (name, description, config, config_version, is_auto, created_by_user_id)
       VALUES ($1, $2, $3, $4, false, $5) RETURNING id, created_at`,
      [
        name.trim(),
        description || null,
        JSON.stringify(current.rows[0].config),
        current.rows[0].version,
        admin.userId,
      ]
    );

    await logAdminAction(
      admin.userId,
      'config_snapshot_created',
      undefined,
      undefined,
      `Created named snapshot: "${name.trim()}" (config v${current.rows[0].version})`
    );

    return NextResponse.json({
      snapshot: {
        id: result.rows[0].id,
        name: name.trim(),
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
  }
}

async function handleRestore(
  snapshotId: number,
  admin: { userId: string; userName: string }
) {
  if (!snapshotId) {
    return NextResponse.json({ error: 'Snapshot ID is required' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get snapshot
    const snapshot = await client.query(
      'SELECT config, config_version, name FROM site_config_snapshots WHERE id = $1',
      [snapshotId]
    );
    if (snapshot.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
    }

    // Auto-snapshot current config before restore
    const current = await client.query(
      'SELECT config, version FROM site_config WHERE id = 1 FOR UPDATE'
    );
    if (current.rows.length > 0) {
      await client.query(
        `INSERT INTO site_config_snapshots (name, description, config, config_version, is_auto, created_by_user_id)
         VALUES ($1, $2, $3, $4, true, $5)`,
        [
          `Auto-snapshot before restore from "${snapshot.rows[0].name}"`,
          `Automatic snapshot before restoring to snapshot #${snapshotId}`,
          JSON.stringify(current.rows[0].config),
          current.rows[0].version,
          admin.userId,
        ]
      );
    }

    // Restore config
    const newVersion = (current.rows[0]?.version ?? 0) + 1;
    await client.query(
      'UPDATE site_config SET config = $1, version = $2, updated_at = NOW(), updated_by_user_id = $3 WHERE id = 1',
      [JSON.stringify(snapshot.rows[0].config), newVersion, admin.userId]
    );

    await logAdminAction(
      admin.userId,
      'config_restored',
      undefined,
      undefined,
      `Restored config from snapshot "${snapshot.rows[0].name}" (#${snapshotId}, was v${snapshot.rows[0].config_version}) → v${newVersion}`
    );

    await client.query('COMMIT');

    invalidateConfigCache();

    return NextResponse.json({
      message: `Config restored from snapshot "${snapshot.rows[0].name}"`,
      version: newVersion,
      config: snapshot.rows[0].config,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error restoring config:', error);
    return NextResponse.json({ error: 'Failed to restore config' }, { status: 500 });
  } finally {
    client.release();
  }
}
