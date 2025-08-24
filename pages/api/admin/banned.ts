
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { requireAdmin } from '../../../utils/clerkAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await requireAdmin(req);

  if (!authResult.isAuthenticated) {
    return res.status(401).json({ 
      error: authResult.error || 'Unauthorized - Admin access required' 
    });
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
