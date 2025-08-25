import { NextApiRequest, NextApiResponse } from 'next';
import { requireAdmin } from '../../../utils/nextauth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const authResult = await requireAdmin(req, res);

    if (!authResult.isAuthenticated) {
      return res.status(401).json({ 
        authenticated: false, 
        message: authResult.error || 'Authentication failed'
      });
    }

    return res.status(200).json({ 
      authenticated: true, 
      user: authResult.user?.email,
      role: authResult.user?.role
    });
  }

  res.status(405).end();
}