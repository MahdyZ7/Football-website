import type { ReactNode } from 'react';
import { RemovalDialog, DesignSandbox } from 'football-ds';
import { players, noop } from './_fixtures';

const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[720px] h-[860px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>{children}</div>
);

export const OwnRegistration = () => (
  <Frame><RemovalDialog isOpen targetIntra="jdoe" removeReason="" users={players} onReasonChange={noop} onConfirm={noop} onCancel={noop} /></Frame>
);

export const AdminRemoval = () => (
  <DesignSandbox session="admin">
    <Frame><RemovalDialog isOpen targetIntra="jsmith" removeReason="LATE" users={players} onReasonChange={noop} onConfirm={noop} onCancel={noop} /></Frame>
  </DesignSandbox>
);
