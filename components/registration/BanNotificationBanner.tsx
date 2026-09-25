'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

export function BanNotificationBanner() {
  const { data: session } = useSession();

  if (!session?.user?.isBanned) return null;

  const banReason = session.user.banReason || 'Violation of rules';
  const bannedUntil = session.user.bannedUntil
    ? new Date(session.user.bannedUntil).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Unknown';

  return (
    <div
      role="status"
      className="mb-6 px-5 py-4 rounded-md border-[1.5px] border-l-[6px]"
      style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--bg-card)' }}
    >
      <h3 className="text-[1.5rem] leading-tight m-0" style={{ color: 'var(--danger)' }}>
        You&apos;re banned until {bannedUntil}
      </h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Reason: {banReason}. You can sign up again once the ban ends.
      </p>
    </div>
  );
}
