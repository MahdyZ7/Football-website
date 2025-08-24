
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { logAdminAction } from '../../../utils/adminLogger';
import { requireAdmin } from '../../../utils/clerkAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authResult = await requireAdmin(req);
  
  if (!authResult.isAuthenticated) {
    return res.status(401).json({ 
      error: authResult.error || 'Unauthorized - Admin access required' 
    });
  }

  const adminUser = authResult.user!.email;

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
