import { NextApiRequest } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { UserRole, getUserRole, hasRole } from './roles';

export interface AuthResult {
  isAuthenticated: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
    role: UserRole;
  };
  error?: string;
}

export async function authenticateRequest(req: NextApiRequest, res: any): Promise<AuthResult> {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
      return {
        isAuthenticated: false,
        error: 'Not authenticated'
      };
    }

    const role = await getUserRole(session.user.email);

    return {
      isAuthenticated: true,
      user: {
        id: (session as any).user?.id || 'unknown', // TODO: Fix type for user ID
        email: session.user.email,
        name: session.user.name || undefined,
        role: role
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

export async function requireRole(req: NextApiRequest, res: any, requiredRole: UserRole): Promise<AuthResult> {
  const authResult = await authenticateRequest(req, res);

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

export async function requireAdmin(req: NextApiRequest, res: any): Promise<AuthResult> {
  return requireRole(req, res, UserRole.ADMIN);
}