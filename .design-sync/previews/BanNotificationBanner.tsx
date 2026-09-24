import { BanNotificationBanner, DesignSandbox } from 'football-ds';

// Renders only for a banned session.
export const Banned = () => (
  <DesignSandbox session="banned"><div className="w-[640px]"><BanNotificationBanner /></div></DesignSandbox>
);
