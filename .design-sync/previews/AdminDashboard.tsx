import type React from 'react';
import { AdminDashboard, DesignSandbox } from 'football-ds';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-[1200px] h-[1000px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>{children}</div>
);

export const UsersTab = () => (<DesignSandbox session="admin" pathname="/admin"><Frame><AdminDashboard /></Frame></DesignSandbox>);
export const FeedbackTab = () => (<DesignSandbox session="admin" pathname="/admin" search="tab=feedback"><Frame><AdminDashboard /></Frame></DesignSandbox>);
export const NotAdmin = () => (<DesignSandbox session="player" pathname="/admin"><Frame><AdminDashboard /></Frame></DesignSandbox>);
