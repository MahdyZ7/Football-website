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
    <div className="max-w-md mx-auto mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700">
      <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
        Account Banned
      </h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-1">
        <span className="font-medium">Reason:</span> {banReason}
      </p>
      <p className="text-sm text-red-600 dark:text-red-300">
        <span className="font-medium">Ban expires:</span> {bannedUntil}
      </p>
    </div>
  );
}
