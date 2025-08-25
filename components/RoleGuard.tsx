import React from 'react';
import { useRoleAuth } from '../hooks/useRoleAuth';
import { UserRole } from '../types/auth';
import { signIn } from 'next-auth/react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
  allowUnauthenticated?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRole, 
  fallback,
  allowUnauthenticated = false 
}) => {
  const { isLoaded, isSignedIn, hasRole } = useRoleAuth();

  if (!isLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px' 
      }}>
        Loading...
      </div>
    );
  }

  // If user is not signed in and unauthenticated access is not allowed
  if (!isSignedIn && !allowUnauthenticated) {
    return fallback || (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <h3>Authentication Required</h3>
        <p>Please sign in to access this feature.</p>
        <button 
          onClick={() => signIn()}
          style={{
            background: 'var(--ft-primary)',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Sign In
        </button>
      </div>
    );
  }

  // If a role is required and user doesn't have it
  if (requiredRole && isSignedIn && !hasRole(requiredRole)) {
    return fallback || (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        background: 'var(--bg-card)',
        borderRadius: '8px',
        margin: '2rem 0'
      }}>
        <h3>Access Denied</h3>
        <p>You don&apos;t have the required permissions to access this feature.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;