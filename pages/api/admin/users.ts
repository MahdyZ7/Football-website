
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { logAdminAction } from '../../../utils/adminLogger';

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
          'User-Agent': req.headers['user-agent'] || 'NextJS-Admin'
        }
      });
      
      if (!userInfoResponse.ok) {
        return null;
      }
      
      const userData = await userInfoResponse.json();
      adminUser = userData.name;
    } catch (error) {
      console.error('Error fetching user info:', error);
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

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const client = await pool.connect();
      
      // Get user info before deletion for logging
      const userResult = await client.query('SELECT name FROM players WHERE intra = $1', [id]);
      const userName = userResult.rows[0]?.name || 'Unknown';
      
      await client.query('DELETE FROM players WHERE intra = $1', [id]);
      client.release();
      
      // Log the action
      await logAdminAction({
        adminUser: adminUser,
        action: 'user_deleted',
        targetUser: id,
        targetName: userName,
        details: 'User deleted from system'
      });
      
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
