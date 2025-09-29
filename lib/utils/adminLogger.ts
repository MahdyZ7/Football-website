
import pool from './db';

export interface AdminLogEntry {
  adminUser: string;
  action: string;
  targetUser?: string;
  targetName?: string;
  details?: string;
}

export async function logAdminAction(entry: AdminLogEntry) {
  try {
    const client = await pool.connect();
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
    client.release();
    console.log('Admin action logged:', entry);
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}
