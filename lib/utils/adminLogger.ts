
import pool from './db';

export interface AdminLogEntry {
  adminUser: string;
  action: string;
  targetUser?: string;
  targetName?: string;
  details?: string;
}

// New signature that accepts userId
export async function logAdminAction(
  performedByUserId: number,
  action: string,
  targetUser?: string,
  targetName?: string,
  details?: string
): Promise<void>;

// Legacy signature for backwards compatibility
export async function logAdminAction(entry: AdminLogEntry): Promise<void>;

// Implementation
export async function logAdminAction(
  performedByUserIdOrEntry: number | AdminLogEntry,
  action?: string,
  targetUser?: string,
  targetName?: string,
  details?: string
) {
  try {
    const client = await pool.connect();

    // Handle both old and new signatures
    if (typeof performedByUserIdOrEntry === 'number') {
      // New signature with userId
      const userId = performedByUserIdOrEntry;

      // Get admin username for the admin_user column
      const userResult = await client.query(
        'SELECT name, email FROM users WHERE id = $1',
        [userId]
      );
      const adminUserName = userResult.rows[0]?.name || userResult.rows[0]?.email || 'Unknown Admin';

      await client.query(`
        INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, performed_by_user_id)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        adminUserName,
        action,
        targetUser || null,
        targetName || null,
        details || null,
        userId
      ]);
      console.log('Admin action logged:', { adminUserName, action, targetUser, targetName, details, userId });
    } else {
      // Old signature for backwards compatibility
      const entry = performedByUserIdOrEntry;
      await client.query(`
        INSERT INTO admin_logs (admin_user, action, target_user, target_name, details)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        entry.adminUser,
        entry.action,
        entry.targetUser || null,
        entry.targetName || null,
        entry.details || null
      ]);
      console.log('Admin action logged (legacy):', entry);
    }

    client.release();
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}
