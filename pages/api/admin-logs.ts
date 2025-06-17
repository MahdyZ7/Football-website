
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      const { rows } = await client.query(`
        SELECT 
          id, 
          admin_user, 
          action, 
          target_user, 
          target_name, 
          details, 
          timestamp 
        FROM admin_logs 
        ORDER BY timestamp DESC 
        LIMIT 100
      `);
      client.release();
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).end();
  }
}
