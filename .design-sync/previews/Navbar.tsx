import type React from 'react';
import { Navbar, DesignSandbox } from 'football-ds';

// Navbar is position:fixed at the top; the transformed frame contains it for the card.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[1200px] h-[96px]" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>{children}</div>
);

export const Player = () => (<DesignSandbox session="player" pathname="/"><Frame><Navbar /></Frame></DesignSandbox>);
export const Admin = () => (<DesignSandbox session="admin" pathname="/teams"><Frame><Navbar /></Frame></DesignSandbox>);
export const SignedOut = () => (<DesignSandbox session="guest" pathname="/"><Frame><Navbar /></Frame></DesignSandbox>);
