
import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check for Replit authentication headers (server-side)
      const userName = req.headers['x-replit-user-name'] as string;
      
      // If no server headers, try client-side approach
      if (!userName) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;
        const origin = req.headers.origin;
        
        console.log('Debug - Admin auth headers:');
        console.log('- Protocol:', protocol);
        console.log('- Host:', host);
        console.log('- Origin:', origin);
        
        // Try multiple URL formats to see which one works
        const authUrls = [
          `${protocol}://${host}/__replauthuser`,
          `${origin}/__replauthuser`,
          `https://${host}/__replauthuser`
        ].filter(Boolean);
        
        let userInfoResponse;
        let lastError;
        
        for (const authUrl of authUrls) {
          try {
            console.log('- Trying auth URL:', authUrl);
            userInfoResponse = await fetch(authUrl, {
              headers: {
                'Cookie': req.headers.cookie || '',
                'User-Agent': req.headers['user-agent'] || 'NextJS-Admin',
                'Referer': req.headers.referer || `${protocol}://${host}/admin`
              }
            });
            
            console.log('- Response status:', userInfoResponse.status);
            
            if (userInfoResponse.ok) {
              break; // Success, exit the loop
            } else {
              const errorText = await userInfoResponse.text();
              console.log('- Response error:', errorText.substring(0, 200));
              lastError = errorText;
            }
          } catch (error) {
            console.log('- Fetch error:', error.message);
            lastError = error.message;
            continue;
          }
        }

        if (!userInfoResponse || !userInfoResponse.ok) {
          return res.status(401).json({ 
            authenticated: false, 
            message: 'Not logged in with Replit',
            debug: {
              triedUrls: authUrls,
              lastError: lastError?.substring(0, 200)
            }
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
