// Shared in-memory "router" state for the design sandbox. The next/link and
// next/navigation shims read it; DesignSandbox provides it. Outside a sandbox
// the defaults below apply (pathname "/", empty query, navigation is a no-op).
import { createContext } from 'react';

export interface SandboxRouterState {
  pathname: string;
  searchParams: URLSearchParams;
  navigate: (href: string) => void;
}

export const SandboxRouterContext = createContext<SandboxRouterState>({
  pathname: '/',
  searchParams: new URLSearchParams(),
  navigate: () => {},
});
