import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './[...nextauth]';
import { getUserRole } from '../../../utils/roles';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const role = await getUserRole(session.user.email);
    return res.status(200).json({ role });
    
  } catch (error) {
    console.error('Error getting user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}