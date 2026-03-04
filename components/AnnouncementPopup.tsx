'use client';

import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/SiteConfigContext';
import { Button } from './ui/Button';

export function AnnouncementPopup() {
  const { config, version } = useConfig();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!config.announcement.enabled || !config.announcement.message) return;
    const dismissedKey = `announcement_dismissed_v${version}`;
    const wasDismissed = sessionStorage.getItem(dismissedKey) === 'true';
    setDismissed(wasDismissed);
  }, [config.announcement.enabled, config.announcement.message, version]);

  if (!config.announcement.enabled || !config.announcement.message || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(`announcement_dismissed_v${version}`, 'true');
    setDismissed(true);
  };

  const borderColors: Record<string, string> = {
    info: '#3b82f6',
    warning: '#f97316',
    success: '#22c55e',
    error: '#ef4444',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        onClick={config.announcement.dismissible ? handleDismiss : undefined}
      />
      {/* Popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="rounded-xl shadow-2xl max-w-lg w-full border-l-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderLeftColor: borderColors[config.announcement.type] || borderColors.info,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {config.announcement.title || 'Announcement'}
            </h2>
            <p className="mb-6 whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
              {config.announcement.message}
            </p>
            {config.announcement.dismissible && (
              <div className="flex justify-end">
                <Button onClick={handleDismiss} variant="primary">
                  Got it
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
