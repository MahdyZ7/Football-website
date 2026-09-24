import type { ReactNode } from 'react';
import { ConfirmDialog } from 'football-ds';

// The dialog is a fixed full-screen overlay; the transformed frame contains it for the card.
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[640px] h-[340px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>
    <span className="sr-only">Confirmation dialog preview</span>
    {children}
  </div>
);
const noop = () => {};

export const Danger = () => (
  <Frame>
    <ConfirmDialog isOpen type="danger" title="Delete player?" message="Remove Jane Smith (jsmith) from this week's list? This cannot be undone." confirmText="Delete" cancelText="Cancel" onConfirm={noop} onCancel={noop} />
  </Frame>
);

export const Warning = () => (
  <Frame>
    <ConfirmDialog isOpen type="warning" title="Unban player?" message="Paul Morris will be able to register again immediately." confirmText="Unban" onConfirm={noop} onCancel={noop} />
  </Frame>
);

export const Info = () => (
  <Frame>
    <ConfirmDialog isOpen type="info" title="Restore snapshot?" message="The site configuration will be restored to 'Before spring schedule'. An automatic snapshot is taken first." confirmText="Restore" onConfirm={noop} onCancel={noop} />
  </Frame>
);
