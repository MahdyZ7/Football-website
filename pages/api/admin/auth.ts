
import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_LOGINS = ['login1', 'login2']; // Add 42 logins of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = req.cookies['admin_session'];
    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    try {
      const client = await pool.connect();
      const { rows } = await client.query(
        'SELECT intra FROM admin_sessions WHERE session_id = $1',
        [session]
      );
      client.release();

      if (rows.length > 0 && ADMIN_LOGINS.includes(rows[0].intra)) {
        return res.status(200).json({ authenticated: true });
      }
      
      return res.status(401).json({ authenticated: false });
    } catch (error) {
      return res.status(500).json({ error: 'Database error' });
    }
  }
  
  res.status(405).end();
}
