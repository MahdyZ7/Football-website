import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/utils/db';
import { auth } from '../../../../auth';
import { logAdminAction } from '../../../../lib/utils/adminLogger';
import { invalidateConfigCache } from '../../../../lib/config/server';
import { DEFAULT_CONFIG, migrateConfig } from '../../../../lib/config/defaults';

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
    const result = await pool.query(
      'SELECT config, version, updated_at, updated_by_user_id FROM site_config WHERE id = 1'
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ config: DEFAULT_CONFIG, version: 0 });
    }

    // Look up who last updated
    let updatedByName = null;
    if (result.rows[0].updated_by_user_id) {
      const userResult = await pool.query(
        'SELECT name FROM users WHERE id = $1',
        [result.rows[0].updated_by_user_id]
      );
      if (userResult.rows.length > 0) {
        updatedByName = userResult.rows[0].name;
      }
    }

    return NextResponse.json({
      config: migrateConfig(result.rows[0].config),
      version: result.rows[0].version,
      updatedAt: result.rows[0].updated_at,
      updatedByName,
    });
  } catch (error) {
    console.error('Error fetching admin config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      );
    } else {
      result[key] = sourceVal;
    }
  }
  return result;
}

export async function PATCH(req: NextRequest) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
  }

  const client = await pool.connect();
  try {
    const { changes, expectedVersion } = await req.json();

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json({ error: 'Invalid changes payload' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Get current config with row lock
    const current = await client.query(
      'SELECT config, version FROM site_config WHERE id = 1 FOR UPDATE'
    );
    if (current.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Config not initialized. Run db:migrate:site-config' }, { status: 500 });
    }

    const currentVersion = current.rows[0].version;
    const currentConfig = current.rows[0].config;

    // Optimistic concurrency check
    if (expectedVersion !== undefined && expectedVersion !== currentVersion) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        {
          error: 'Config was modified by another admin. Please refresh and try again.',
          currentVersion,
        },
        { status: 409 }
      );
    }

    // Auto-snapshot before applying changes
    await client.query(
      `INSERT INTO site_config_snapshots (name, description, config, config_version, is_auto, created_by_user_id)
       VALUES ($1, $2, $3, $4, true, $5)`,
      [
        `Auto-snapshot before update v${currentVersion + 1}`,
        `Automatic snapshot before config update by ${admin.userName}`,
        JSON.stringify(currentConfig),
        currentVersion,
        admin.userId,
      ]
    );

    // Prune old auto-snapshots (keep last 50)
    await client.query(`
      DELETE FROM site_config_snapshots
      WHERE is_auto = true AND id NOT IN (
        SELECT id FROM site_config_snapshots WHERE is_auto = true ORDER BY created_at DESC LIMIT 50
      )
    `);

    // Deep merge changes into current config
    const mergedConfig = deepMerge(currentConfig, changes);
    const newVersion = currentVersion + 1;

    await client.query(
      'UPDATE site_config SET config = $1, version = $2, updated_at = NOW(), updated_by_user_id = $3 WHERE id = 1',
      [JSON.stringify(mergedConfig), newVersion, admin.userId]
    );

    // Log the action
    const changedKeys = Object.keys(changes);
    await logAdminAction(
      admin.userId,
      'config_updated',
      undefined,
      undefined,
      `Updated config keys: ${changedKeys.join(', ')} (v${currentVersion} → v${newVersion})`
    );

    await client.query('COMMIT');

    invalidateConfigCache();

    return NextResponse.json({
      config: mergedConfig,
      version: newVersion,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  } finally {
    client.release();
  }
}
