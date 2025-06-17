
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Get user info from Replit's user endpoint
      const userResponse = await fetch('https://replit.com/@api/user', {
        headers: {
          'Cookie': req.headers.cookie || ''
        }
      });

      if (!userResponse.ok) {
        return res.status(401).json({ 
          authenticated: false, 
          message: 'Not logged in with Replit' 
        });
      }

      const userData = await userResponse.json();
      const userName = userData.username;

      if (!userName) {
        return res.status(401).json({ 
          authenticated: false, 
          message: 'Unable to get user information' 
        });
      }

      console.log('Authenticated user:', userName);

      // Check if user is in admin list
      if (ADMIN_USERS.includes(userName)) {
        return res.status(200).json({ authenticated: true, user: userName });
      }
      
      return res.status(403).json({ 
        authenticated: false, 
        message: `Access denied: User '${userName}' does not have admin privileges` 
      });

    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ 
        authenticated: false, 
        message: 'Authentication service error' 
      });
    }
  }
  
  res.status(405).end();
}
