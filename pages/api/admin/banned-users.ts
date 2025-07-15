
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';

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

  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      const { rows } = await client.query(`
        SELECT id, name, reason, banned_at, banned_until 
        FROM banned_users 
        ORDER BY banned_at DESC
      `);
      client.release();
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching banned users:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
