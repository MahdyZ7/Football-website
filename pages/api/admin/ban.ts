
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { logAdminAction } from '../../../utils/adminLogger';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

async function getAuthenticatedUser(req: NextApiRequest): Promise<string | null> {
  // Check for Replit authentication headers first (more reliable)
  let adminUser = req.headers['x-replit-user-name'] as string;

  // If no server headers, try client-side approach
  if (!adminUser) {
    try {
      const protocol = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers.host;
      const authUrl = `${protocol}://${host}/__replauthuser`;

      const userInfoResponse = await fetch(authUrl, {
        headers: {
          'Cookie': req.headers.cookie || '',
          'User-Agent': req.headers['user-agent'] || 'NextJS-Admin',
          'Referer': req.headers.referer || `${protocol}://${host}/admin`
        }
      });

      if (!userInfoResponse.ok) {
        console.error('Auth request failed:', userInfoResponse.status);
        return null;
      }

      const userData = await userInfoResponse.json();
      adminUser = userData.name;
    } catch (fetchError) {
      console.error('Error fetching user info:', fetchError);
      return null;
    }
  }

  return adminUser;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const adminUser = await getAuthenticatedUser(req);

  if (!adminUser) {
    return res.status(401).json({ error: 'Unauthorized - Not logged in' });
  }

  if (!ADMIN_USERS.includes(adminUser)) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
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
      bannedUntil.setDate(bannedUntil.getDate() + parseFloat(duration));

      // Insert or update ban record
      await client.query(`
        INSERT INTO banned_users (id, name, reason, banned_at, banned_until)
        VALUES ($1, $2, $3, NOW(), $4)
        ON CONFLICT (id) 
        DO UPDATE SET reason = $2, banned_at = NOW(), banned_until = $4
      `, [userId, userName, reason, bannedUntil]);

      // Log the action
      await logAdminAction({
        adminUser: adminUser,
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

      // Get user name for logging
      const userResult = await client.query('SELECT name FROM banned_users WHERE id = $1', [id]);
      const userName = userResult.rows[0]?.name || 'Unknown';

      await client.query('DELETE FROM banned_users WHERE id = $1', [id]);

      // Log the action
      await logAdminAction({
        adminUser: adminUser,
        action: 'user_unbanned',
        targetUser: id,
        targetName: userName,
        details: 'User unbanned'
      });

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
