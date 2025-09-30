import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERS = ['MahdyZ7']; // Add Replit usernames of admins here

export async function GET(req: NextRequest) {
  try {
    // Check for Replit authentication headers (server-side)
    let userName = req.headers.get('x-replit-user-name');

    // If no server headers, try client-side approach
    if (!userName) {
      const protocol = req.headers.get('x-forwarded-proto') || 'https';
      const host = req.headers.get('host');

      const authUrl = `${protocol}://${host}/__replauthuser`;

      try {
        const userInfoResponse = await fetch(authUrl, {
          headers: {
            'Cookie': req.headers.get('cookie') || '',
            'User-Agent': req.headers.get('user-agent') || 'NextJS-Admin',
            'Referer': req.headers.get('referer') || `${protocol}://${host}/admin`
          }
        });

        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          return NextResponse.json({
            authenticated: false,
            message: 'Not logged in with Replit',
            debug: {
              authUrl,
              status: userInfoResponse.status,
              error: errorText.substring(0, 200)
            }
          }, { status: 401 });
        }

        const userData = await userInfoResponse.json();
        userName = userData.name;

      } catch (fetchError) {
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        console.error('- Fetch error:', errorMessage);
        return NextResponse.json({
          authenticated: false,
          message: 'Authentication service error',
          debug: {
            error: errorMessage
          }
        }, { status: 401 });
      }
    }

    if (!userName) {
      return NextResponse.json({
        authenticated: false,
        message: 'Unable to get user information'
      }, { status: 401 });
    }

    // Check if user is in admin list
    if (ADMIN_USERS.includes(userName)) {
      return NextResponse.json({ authenticated: true, user: userName }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: false,
      message: `Access denied: User '${userName}' does not have admin privileges`
    }, { status: 403 });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Authentication service error'
    }, { status: 500 });
  }
}