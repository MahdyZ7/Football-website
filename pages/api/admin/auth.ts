
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here
// To add more admins, add their Replit usernames to this array:
// const ADMIN_USERS = ['MahdyZ7', 'another_username', 'third_admin'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Check for Replit authentication headers
    const userId = req.headers['x-replit-user-id'];
    const userName = req.headers['x-replit-user-name'];
    
    if (!userId || !userName) {
      return res.status(401).json({ 
        authenticated: false, 
        message: 'Not logged in with Replit' 
      });
    }

    // Check if user is in admin list
    if (ADMIN_USERS.includes(userName as string)) {
      return res.status(200).json({ authenticated: true, user: userName });
    }
    
    return res.status(403).json({ 
      authenticated: false, 
      message: `Access denied: User '${userName}' does not have admin privileges` 
    });
  }
  
  res.status(405).end();
}
