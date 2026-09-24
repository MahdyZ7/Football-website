import type { ReactNode } from 'react';
import { EditNameDialog } from 'football-ds';
import { noop } from './_fixtures';

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[640px] h-[380px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>{children}</div>
);

export const Open = () => (
  <Frame><EditNameDialog isOpen nameValue="Jon Doe" isPending={false} onNameChange={noop} onConfirm={noop} onCancel={noop} /></Frame>
);
export const Saving = () => (
  <Frame><EditNameDialog isOpen nameValue="John Doe" isPending onNameChange={noop} onConfirm={noop} onCancel={noop} /></Frame>
);
