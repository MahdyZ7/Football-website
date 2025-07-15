import { NextApiRequest, NextApiResponse } from 'next';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Check for Replit authentication headers (server-side)
      let userName = req.headers['x-replit-user-name'] as string;

      // If no server headers, try client-side approach
      if (!userName) {
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const host = req.headers.host;

        console.log('Debug - Admin auth attempt:');
        console.log('- Protocol:', protocol);
        console.log('- Host:', host);

        const authUrl = `${protocol}://${host}/__replauthuser`;

        try {
          console.log('- Trying auth URL:', authUrl);
          const userInfoResponse = await fetch(authUrl, {
            headers: {
              'Cookie': req.headers.cookie || '',
              'User-Agent': req.headers['user-agent'] || 'NextJS-Admin',
              'Referer': req.headers.referer || `${protocol}://${host}/admin`
            }
          });

          console.log('- Response status:', userInfoResponse.status);

          if (!userInfoResponse.ok) {
            const errorText = await userInfoResponse.text();
            console.log('- Auth failed:', errorText.substring(0, 200));
            return res.status(401).json({ 
              authenticated: false, 
              message: 'Not logged in with Replit',
              debug: {
                authUrl,
                status: userInfoResponse.status,
                error: errorText.substring(0, 200)
              }
            });
          }

          const userData = await userInfoResponse.json();
          userName = userData.name;
          console.log('- Successfully authenticated user:', userName);

        } catch (fetchError) {
          const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
          console.error('- Fetch error:', errorMessage);
          return res.status(401).json({ 
            authenticated: false, 
            message: 'Authentication service error',
            debug: {
              error: errorMessage
            }
          });
        }
      } else {
        console.log('Authenticated user (server headers):', userName);
      }

      if (!userName) {
        return res.status(401).json({ 
          authenticated: false, 
          message: 'Unable to get user information' 
        });
      }

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