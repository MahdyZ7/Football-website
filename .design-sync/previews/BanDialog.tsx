import type React from 'react';
import { BanDialog } from 'football-ds';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[720px] h-[640px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}><span className="sr-only">Ban dialog preview</span>{children}</div>
);
const noop = () => {};

export const Open = () => (
  <Frame><BanDialog targetUser={{ name: 'Paul Morris', intra: 'pmorris' }} onConfirm={noop} onCancel={noop} isPending={false} /></Frame>
);
export const Pending = () => (
  <Frame><BanDialog targetUser={{ name: 'Paul Morris', intra: 'pmorris' }} onConfirm={noop} onCancel={noop} isPending /></Frame>
);
