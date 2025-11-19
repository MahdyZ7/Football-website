import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not logged in. Please sign in to continue.'
      }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.isAdmin) {
      return NextResponse.json({
        authenticated: true,
        user: session.user.name || session.user.email,
        userId: session.user.id
      }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: false,
      message: `Access denied: You do not have admin privileges`
    }, { status: 403 });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({
      authenticated: false,
      message: 'Authentication service error'
    }, { status: 500 });
  }
}