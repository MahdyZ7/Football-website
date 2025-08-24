import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { UserRole, getUserRole } from '../utils/roles';

export interface UseRoleAuthReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any;
  role: UserRole | null;
  isAdmin: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
}

export function useRoleAuth(): UseRoleAuthReturn {
  const { user, isLoaded, isSignedIn } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    if (isSignedIn && user?.emailAddresses[0]?.emailAddress) {
      const userRole = getUserRole(user.emailAddresses[0].emailAddress);
      setRole(userRole);
    } else {
      setRole(null);
    }
  }, [isSignedIn, user]);

  const hasRole = (requiredRole: UserRole): boolean => {
    if (!role) return false;
    
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 1
    };

    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  return {
    isLoaded,
    isSignedIn: isSignedIn || false,
    user,
    role,
    isAdmin: role === UserRole.ADMIN,
    hasRole
  };
}