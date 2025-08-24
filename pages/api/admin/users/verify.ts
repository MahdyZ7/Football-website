import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../utils/db';
import { logAdminAction } from '../../../../utils/adminLogger';
import { requireAdmin } from '../../../../utils/clerkAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PATCH') {
    try {
      const authResult = await requireAdmin(req);

      if (!authResult.isAuthenticated) {
        return res.status(401).json({ 
          error: authResult.error || 'Unauthorized - Admin access required' 
        });
      }

      const adminUser = authResult.user!.email;

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