
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = req.cookies['admin_session'];
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'PATCH') {
    try {
      const { id, verified } = req.body;
      const client = await pool.connect();
      
      await client.query(
        'UPDATE players SET verified = $1 WHERE intra = $2',
        [verified, id]
      );
      
      client.release();
      res.status(200).json({ message: 'User verification status updated' });
    } catch (error) {
      console.error('Error updating verification:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
