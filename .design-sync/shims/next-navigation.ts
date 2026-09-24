// Stand-in for `next/navigation` in the design bundle (no Next.js runtime there).
// Navigation updates the sandbox's in-memory route, so tab/query-driven UI
// (e.g. AdminDashboard ?tab=) stays interactive inside a design.
import { useContext, useMemo } from 'react';
import { SandboxRouterContext } from './router-context';

export function useRouter() {
  const { navigate } = useContext(SandboxRouterContext);
  return useMemo(
    () => ({
      push: (href: string, _options?: { scroll?: boolean }) => navigate(href),
      replace: (href: string, _options?: { scroll?: boolean }) => navigate(href),
      back: () => {},
      forward: () => {},
      refresh: () => {},
      prefetch: () => {},
    }),
    [navigate],
  );
}

export function usePathname() {
  return useContext(SandboxRouterContext).pathname;
}

export function useSearchParams() {
  return useContext(SandboxRouterContext).searchParams;
}

export function useParams(): Record<string, string> {
  return {};
}

export function redirect(href: string): never {
  throw new Error(`redirect(${href}) is not available in the design sandbox`);
}

export function notFound(): never {
  throw new Error('notFound() is not available in the design sandbox');
}
