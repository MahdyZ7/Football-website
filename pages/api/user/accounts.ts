import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import pool from '../../../utils/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const client = await pool.connect();
    
    try {
      // Get user ID
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [session.user.email]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResult.rows[0].id;

      // Get linked accounts
      const accountsResult = await client.query(
        'SELECT provider, "providerAccountId", type FROM accounts WHERE "userId" = $1',
        [userId]
      );

      const linkedAccounts = accountsResult.rows.map(account => ({
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type,
        // Don't expose sensitive account details
      }));

      return res.status(200).json({ 
        linkedAccounts,
        totalAccounts: linkedAccounts.length 
      });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}