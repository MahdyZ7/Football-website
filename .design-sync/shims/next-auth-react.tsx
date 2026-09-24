// Stand-in for `next-auth/react`: the session comes from DesignSandbox (a demo
// player, an admin, or signed out) instead of the NextAuth API.
import React, { createContext, useContext } from 'react';

export interface SandboxSessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin?: boolean;
  role?: string;
  isBanned?: boolean;
  bannedUntil?: string | null;
  banReason?: string | null;
}

export interface Session {
  user: SandboxSessionUser;
  expires: string;
}

type Status = 'authenticated' | 'unauthenticated' | 'loading';

interface SessionValue {
  data: Session | null;
  status: Status;
  update: () => Promise<Session | null>;
}

const SessionContext = createContext<SessionValue>({
  data: null,
  status: 'unauthenticated',
  update: async () => null,
});

export function SessionProvider({
  session = null,
  status,
  children,
}: {
  session?: Session | null;
  status?: Status;
  children: React.ReactNode;
}) {
  const value: SessionValue = {
    data: session,
    status: status ?? (session ? 'authenticated' : 'unauthenticated'),
    update: async () => session,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}

export async function signIn(_provider?: string, _options?: Record<string, unknown>) {}
export async function signOut(_options?: { callbackUrl?: string; redirect?: boolean }) {}
export async function getSession() {
  return null;
}
