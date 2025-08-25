import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { UserRole } from '../types/auth';

export interface UseRoleAuthReturn {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any;
  role: UserRole | null;
  isAdmin: boolean;
  hasRole: (requiredRole: UserRole) => boolean;
}

export function useRoleAuth(): UseRoleAuthReturn {
  const { data: session, status } = useSession();
  const [role, setRole] = useState<UserRole | null>(null);
  const isLoaded = status !== 'loading';
  const isSignedIn = status === 'authenticated';

  useEffect(() => {
    const fetchRole = async () => {
      if (isSignedIn && session?.user?.email) {
        try {
          // Fetch role from API instead of directly from database
          const response = await fetch('/api/auth/user-role');
          if (response.ok) {
            const data = await response.json();
            setRole(data.role || UserRole.USER);
          } else {
            setRole(UserRole.USER);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setRole(UserRole.USER);
        }
      } else {
        setRole(null);
      }
    };

    fetchRole();
  }, [isSignedIn, session?.user?.email]);

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
    user: session?.user || null,
    role,
    isAdmin: role === UserRole.ADMIN,
    hasRole
  };
}