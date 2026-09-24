/**
 * DesignSandbox - the app's provider stack for use outside Next.js.
 *
 * Wrap any 42 Football Club component (or a whole page) in it. It supplies what
 * app/layout.tsx supplies in production: React Query, the NextAuth session,
 * SiteConfig, the light/dark theme, the tournament audio context and the sonner
 * Toaster - plus demo data for every /api/* endpoint the hooks call, so
 * data-driven components (player lists, admin tables, tournament votes) render
 * realistic content instead of loading skeletons.
 *
 * @example
 * <DesignSandbox session="admin" theme="dark">
 *   <AdminDashboard />
 * </DesignSandbox>
 */
import React, { useCallback, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { SessionProvider, type Session } from '../shims/next-auth-react';
import { SandboxRouterContext } from '../shims/router-context';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { SiteConfigProvider } from '../../contexts/SiteConfigContext';
import { TournamentAudioProvider } from '../../contexts/TournamentAudioContext';
import type { SiteConfig } from '../../lib/config/defaults';
import * as fx from './fixtures';

export type SandboxSession = 'player' | 'admin' | 'guest' | 'banned' | Session;

export interface DesignSandboxProps {
  children?: React.ReactNode;
  /** Who is signed in: a regular player (default), an admin, nobody, a banned player, or a custom session. */
  session?: SandboxSession;
  /** Force the color theme for this subtree. Omit to follow the saved preference (light by default). */
  theme?: 'light' | 'dark';
  /** Current route for Navbar highlighting and usePathname(). Default "/". */
  pathname?: string;
  /** Query string for useSearchParams(), e.g. "tab=logs". */
  search?: string;
  /** Whether /api/allowed reports registration as open. Default true. */
  registrationOpen?: boolean;
  /** Overrides merged into the default SiteConfig (game days, spots, announcement...). */
  config?: Partial<SiteConfig>;
  /** Serve demo data for /api/* requests. Default true. */
  mockApi?: boolean;
}

const EXPIRES = '2099-01-01T00:00:00.000Z';

function resolveSession(s: SandboxSession): Session | null {
  if (typeof s === 'object') return s;
  switch (s) {
    case 'guest':
      return null;
    case 'admin':
      return { expires: EXPIRES, user: { id: 'u-admin', name: 'Admin User', email: 'admin@42school.com', image: null, isAdmin: true, role: 'admin' } };
    case 'banned':
      return {
        expires: EXPIRES,
        user: {
          id: 'u-lchen', name: 'Li Chen', email: 'lchen@student.42.fr', image: null, isAdmin: false, role: 'user', isBanned: true,
          bannedUntil: new Date(Date.now() + 7 * 86400_000).toISOString(), banReason: 'Late arrival (over 15 minutes)',
        },
      };
    default:
      return { expires: EXPIRES, user: { id: 'u-jdoe', name: 'John Doe', email: 'jdoe@student.42.fr', image: null, isAdmin: false, role: 'user' } };
  }
}

// --- /api mock -------------------------------------------------------------
// fetch is global, so the most recently rendered sandbox's options win.
interface MockState { intra: string | null; authed: boolean; open: boolean; config: SiteConfig }
let mockState: MockState = { intra: fx.DEMO_PLAYER_INTRA, authed: true, open: true, config: fx.DEFAULT_CONFIG };
let installed = false;

function setMockState(next: MockState) {
  mockState = next;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function route(path: string, method: string): Response {
  const s = mockState;
  if (method !== 'GET') {
    if (path === '/api/register' && method === 'POST') {
      return json({ name: 'John Doe', id: 'jdoe', registrationStatus: 'confirmed', waitlistPosition: null, message: 'Registered successfully' });
    }
    return json({ success: true, message: 'Saved' });
  }
  switch (path) {
    case '/api/users': return json(fx.users(s.intra));
    case '/api/allowed': return json({ isAllowed: s.open, forceClosed: s.config.registrationForceClosed });
    case '/api/verify': return json({ isAllowed: true });
    case '/api/banned-users':
    case '/api/admin/banned': return json(fx.bannedUsers());
    case '/api/moneyDb': return json(fx.money());
    case '/api/me/history': return s.authed ? json(fx.playerHistory()) : json({ error: 'Authentication required' }, 401);
    case '/api/admin/auth': return json({ authenticated: true, user: 'Admin User' });
    case '/api/admin-logs': return json(fx.adminLogs());
    case '/api/feedback': return json(fx.feedback());
    case '/api/feedback/vote': return json(fx.userVotes());
    case '/api/admin/feedback': return json(fx.adminFeedback());
    case '/api/config':
    case '/api/admin/config': return json(fx.siteConfig(s.config));
    case '/api/admin/config/snapshots': return json(fx.configSnapshots());
    case '/api/tournament-votes': return json({ ...fx.tournamentVotes(), isAuthenticated: s.authed });
    case '/api/admin/tournament-votes': return json(fx.adminTournamentVotes());
    default: return json({ error: `No demo data for ${path}` }, 404);
  }
}

function installMockFetch() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, window.location.href);
    if (url.pathname.startsWith('/api/')) {
      const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
      return route(url.pathname, method);
    }
    return realFetch(input, init);
  };
}

// --- component -------------------------------------------------------------
export function DesignSandbox({
  children,
  session = 'player',
  theme,
  pathname = '/',
  search = '',
  registrationOpen = true,
  config,
  mockApi = true,
}: DesignSandboxProps) {
  const sess = resolveSession(session);
  const mergedConfig = useMemo(() => ({ ...fx.DEFAULT_CONFIG, ...config }), [config]);

  if (mockApi) {
    setMockState({
      intra: sess ? (session === 'player' ? fx.DEMO_PLAYER_INTRA : null) : null,
      authed: !!sess,
      open: registrationOpen,
      config: mergedConfig,
    });
    installMockFetch();
  }

  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false }, mutations: { retry: false } } }),
  );

  const [loc, setLoc] = useState(() => ({ pathname, search }));
  const navigate = useCallback((href: string) => {
    const u = new URL(href, 'http://sandbox.local' + loc.pathname);
    setLoc({ pathname: u.pathname, search: u.search.replace(/^\?/, '') });
  }, [loc.pathname]);
  const routerValue = useMemo(
    () => ({ pathname: loc.pathname, searchParams: new URLSearchParams(loc.search), navigate }),
    [loc, navigate],
  );

  const body = theme ? (
    <div data-theme={theme} style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100%' }}>
      {children}
    </div>
  ) : children;

  return (
    <SandboxRouterContext.Provider value={routerValue}>
      <SessionProvider session={sess}>
        <QueryClientProvider client={client}>
          <SiteConfigProvider>
            <ThemeProvider>
              <TournamentAudioProvider>
                {body}
                <Toaster position="top-right" richColors closeButton />
              </TournamentAudioProvider>
            </ThemeProvider>
          </SiteConfigProvider>
        </QueryClientProvider>
      </SessionProvider>
    </SandboxRouterContext.Provider>
  );
}

export default DesignSandbox;
