'use client';

import React from 'react';
import { useConfig } from '../../contexts/SiteConfigContext';

function formatDuration(days: number): string {
  if (days === 0) return 'No ban';
  if (days <= 4) return 'Half a week';
  if (days <= 8) return 'One week';
  if (days <= 15) return 'Two weeks';
  if (days <= 30) return 'Four weeks';
  return `${days} days`;
}

export function BanRulesTable() {
  const { config } = useConfig();
  const { banDurations, gracePeriodMinutes, lateThresholdMinutes } = config;

  return (
    <div
      className="max-w-4xl mx-auto mb-12 rounded-lg shadow-md overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
          Late TIG
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <tr>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Action
              </th>
              <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Ban Duration
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Cancel reservation
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(banDurations.CANCEL)} (or {formatDuration(banDurations.CANCEL_GAME_DAY)} if on game day after {config.gameDayBanThresholdHour}:00)
              </td>
            </tr>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Not ready when booking time starts
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(banDurations.NOT_READY)}
              </td>
            </tr>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Late {">"} {lateThresholdMinutes} minutes
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(banDurations.LATE)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                No Show without notice
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                {formatDuration(banDurations.NO_SHOW)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          <strong>Note:</strong> You can remove your registration without a ban within {gracePeriodMinutes} minutes of registering.
        </p>
      </div>
    </div>
  );
}
