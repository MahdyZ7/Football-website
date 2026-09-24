import type { ReactNode } from 'react';
import { ThemeToggle } from 'football-ds';

// ThemeToggle is position:fixed (top-right of the viewport); the transformed
// frame below only contains it for this card.
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-64 h-24 rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-secondary)' }}>
    {children}
  </div>
);

export const Light = () => (
  <Frame><ThemeToggle /></Frame>
);
