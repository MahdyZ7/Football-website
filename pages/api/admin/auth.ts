
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check for Replit authentication headers (server-side)
      const userId = req.headers['x-replit-user-id'];
      const userName = req.headers['x-replit-user-name'] as string;
      
      // If no server headers, try client-side approach
      if (!userName) {
        // Try to get user info from Replit's client endpoint
        const userInfoResponse = await fetch(`${req.headers.origin}/__replauthuser`, {
          headers: {
            'Cookie': req.headers.cookie || ''
          }
        });

        if (!userInfoResponse.ok) {
          return res.status(401).json({ 
            authenticated: false, 
            message: 'Not logged in with Replit' 
          });
        }

        const userData = await userInfoResponse.json();
        const clientUserName = userData.name;

        if (!clientUserName) {
          return res.status(401).json({ 
            authenticated: false, 
            message: 'Unable to get user information' 
          });
        }

        console.log('Authenticated user (client):', clientUserName);

        // Check if user is in admin list
        if (ADMIN_USERS.includes(clientUserName)) {
          return res.status(200).json({ authenticated: true, user: clientUserName });
        }
        
        return res.status(403).json({ 
          authenticated: false, 
          message: `Access denied: User '${clientUserName}' does not have admin privileges` 
        });
      }

      console.log('Authenticated user (server):', userName);

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
