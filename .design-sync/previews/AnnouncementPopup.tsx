import type { ReactNode } from 'react';
import { AnnouncementPopup, DesignSandbox } from 'football-ds';

// Driven by site config: enable it through DesignSandbox's `config` prop.
const Frame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-[640px] h-[360px] overflow-hidden rounded-lg" style={{ transform: 'translateZ(0)', backgroundColor: 'var(--bg-primary)' }}>
    {children}
  </div>
);

export const Info = () => (
  <DesignSandbox config={{ announcement: { enabled: true, type: 'info', dismissible: true, title: 'Pitch change this Thursday', message: "Thursday's game moves to Outdoor Pitch 1. Kick-off stays at 9 PM." } }}>
    <Frame><AnnouncementPopup /></Frame>
  </DesignSandbox>
);

export const Warning = () => (
  <DesignSandbox config={{ announcement: { enabled: true, type: 'warning', dismissible: true, title: 'Registration closes early', message: 'Registration for Monday closes at 6 PM because of the Ramadan schedule.' } }}>
    <Frame><AnnouncementPopup /></Frame>
  </DesignSandbox>
);
