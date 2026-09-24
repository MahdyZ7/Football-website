import type { ReactNode } from 'react';
import { SpecialEventToast } from 'football-ds';

// Fires a sonner toast on mount; DesignSandbox renders the Toaster (top-right).
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[560px] h-[200px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>
    {children}
  </div>
);

export const OnMount = () => (
  <Frame><SpecialEventToast /></Frame>
);
