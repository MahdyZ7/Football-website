import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../utils/db';
import { logAdminAction } from '../../../../utils/adminLogger';

const ADMIN_USERS = ['MahdyZ7'];

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
  if (req.method === 'PATCH') {
    try {
      const adminUser = await getAuthenticatedUser(req);

      if (!adminUser) {
        return res.status(401).json({ error: 'Unauthorized - Not logged in' });
      }

      if (!ADMIN_USERS.includes(adminUser)) {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
      }

      const { id, verified } = req.body;
      const client = await pool.connect();

      // Get user name for logging
      const userResult = await client.query('SELECT name FROM players WHERE intra = $1', [id]);
      const userName = userResult.rows[0]?.name || 'Unknown';

      await client.query('UPDATE players SET verified = $1 WHERE intra = $2', [verified, id]);
      client.release();

      // Log the action
      await logAdminAction({
        adminUser: adminUser,
        action: verified ? 'user_verified' : 'user_unverified',
        targetUser: id,
        targetName: userName,
        details: `User verification status changed to: ${verified ? 'verified' : 'unverified'}`
      });

      res.status(200).json({ message: 'User verification updated' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}