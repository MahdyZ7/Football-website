
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../utils/db';
import { logAdminAction } from '../../../utils/adminLogger';

const ADMIN_USERS = ['MahdyZ7'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.cookies['admin_session'];
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userInfoResponse = await fetch(`${req.headers.origin}/__replauthuser`, {
    headers: {
      'Cookie': req.headers.cookie || ''
    }
  });
  
  if (!userInfoResponse.ok) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userData = await userInfoResponse.json();
  const clientUserName = userData.name;
  
  if (!clientUserName) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!ADMIN_USERS.includes(clientUserName)) {
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
        adminUser: clientUserName,
        action: 'user_deleted',
        targetUser: id,
        targetName: userName,
        details: 'User deleted from system'
      });
      
      res.status(200).json({ message: 'User deleted' });
    } catch {
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
