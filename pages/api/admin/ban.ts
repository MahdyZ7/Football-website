import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Utility function to log admin actions (implementation needed, add to the file for it to be runnable)
async function logAdminAction(logEntry: any) {
  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO admin_logs (admin_user, action, target_user, target_name, details, timestamp) VALUES ($1, $2, $3, $4, $5, NOW())',
      [logEntry.adminUser, logEntry.action, logEntry.targetUser, logEntry.targetName, logEntry.details]
    );
  } catch (error) {
    console.error('Error logging admin action:', error);
  } finally {
    client.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.cookies['admin_session'];
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const client = await pool.connect();

  try {
    if (req.method === 'POST') {
      const { userId, reason, duration } = req.body;

      if (!userId || !reason || !duration) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const userCheck = await client.query('SELECT name FROM players WHERE intra = $1', [userId]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userName = userCheck.rows[0].name;
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + parseInt(duration));

      // Insert or update ban record
      await client.query(`
        INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
        VALUES ($1, $2, $3, NOW(), $4)
        ON CONFLICT (id) 
        DO UPDATE SET reason = $2, banned_at = NOW(), banned_until = $4
      `, [userId, userName, reason, bannedUntil]);

      // Log the action
      await logAdminAction({
        adminUser: req.headers['x-replit-user-name'] as string || 'Unknown Admin',
        action: 'user_banned',
        targetUser: userId,
        targetName: userName,
        details: `Banned for ${duration} days. Reason: ${reason}`
      });

      // Remove user from current registration if they exist
      await client.query('DELETE FROM players WHERE intra = $1', [userId]);

      res.status(200).json({ message: 'User banned successfully' });

    } else if (req.method === 'DELETE') {
      const { id } = req.body;

      await client.query('DELETE FROM banned_users WHERE id = $1', [id]);
      res.status(200).json({ message: 'User unbanned successfully' });

    } else {
      res.status(405).end();
    }
  } catch (error) {
    console.error('Error managing ban:', error);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
}