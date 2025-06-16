
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check for Replit authentication headers
    const userId = req.headers['x-replit-user-id'];
    const userName = req.headers['x-replit-user-name'];
    
    if (!userId || !userName) {
      return res.status(401).json({ authenticated: false });
    }

    // Check if user is in admin list
    if (ADMIN_USERS.includes(userName as string)) {
      return res.status(200).json({ authenticated: true, user: userName });
    }
    
    return res.status(403).json({ authenticated: false, message: 'Access denied: Admin privileges required' });
  }
  
  res.status(405).end();
}
