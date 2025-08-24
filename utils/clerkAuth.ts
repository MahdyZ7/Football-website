import { NextApiRequest } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { UserRole, getUserRole, hasRole } from './roles';

export interface AuthResult {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  error?: string;
}

export async function authenticateRequest(req: NextApiRequest): Promise<AuthResult> {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return {
        isAuthenticated: false,
        error: 'Not authenticated'
      };
    }

    if (!process.env.CLERK_SECRET_KEY) {
      console.error('CLERK_SECRET_KEY not configured');
      return {
        isAuthenticated: false,
        error: 'Authentication service not configured'
      };
    }

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user from Clerk:', response.status, response.statusText);
      return {
        isAuthenticated: false,
        error: 'Failed to fetch user data'
      };
    }

    const userData = await response.json();
    const email = userData.email_addresses?.find((e: any) => e.id === userData.primary_email_address_id)?.email_address;

    if (!email) {
      return {
        isAuthenticated: false,
        error: 'No email found for user'
      };
    }

    const role = getUserRole(email);

    return {
      isAuthenticated: true,
      user: {
        id: userId,
        email,
        role
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      isAuthenticated: false,
      error: 'Authentication service error'
    };
  }
}

export async function requireRole(req: NextApiRequest, requiredRole: UserRole): Promise<AuthResult> {
  const authResult = await authenticateRequest(req);

  if (!authResult.isAuthenticated || !authResult.user) {
    return authResult;
  }

  if (!hasRole(authResult.user.role, requiredRole)) {
    return {
      isAuthenticated: false,
      error: `Insufficient permissions. Required role: ${requiredRole}`
    };
  }

  return authResult;
}

export async function requireAdmin(req: NextApiRequest): Promise<AuthResult> {
  return requireRole(req, UserRole.ADMIN);
}