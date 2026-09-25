import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False during server rendering and the hydration pass, true afterwards.
 * Use it to hold back output that depends on the clock, the user's time zone or
 * client-only query state, so the server HTML and the first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
