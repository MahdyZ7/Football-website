
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';
import { logAdminAction } from '../../../utils/adminLogger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.cookies['admin_session'];
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
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
        adminUser: req.headers['x-replit-user-name'] as string || 'Unknown Admin',
        action: 'user_deleted',
        targetUser: id,
        targetName: userName,
        details: 'User deleted from system'
      });
      
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
