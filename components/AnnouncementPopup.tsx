'use client';

import React, { useCallback, useSyncExternalStore } from 'react';
import { useConfig } from '../contexts/SiteConfigContext';
import { Button } from './ui/Button';

const dismissListeners = new Set<() => void>();

function subscribeDismiss(callback: () => void) {
  dismissListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith('announcement_dismissed_v')) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    dismissListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function readDismissed(version: number): boolean {
  try {
    return sessionStorage.getItem(`announcement_dismissed_v${version}`) === 'true';
  } catch {
    return true;
  }
}

const dismissedByServer = () => true;

export function AnnouncementPopup() {
  const { config, version } = useConfig();
  const dismissed = useSyncExternalStore(
    subscribeDismiss,
    useCallback(() => readDismissed(version), [version]),
    dismissedByServer
  );

  const handleDismiss = useCallback(() => {
    try {
      sessionStorage.setItem(`announcement_dismissed_v${version}`, 'true');
      dismissListeners.forEach((cb) => cb());
    } catch (error) {
      console.error('Failed to persist dismissal:', error);
    }
  }, [version]);

  if (!config.announcement.enabled || !config.announcement.message || dismissed) return null;

  const borderColors: Record<string, string> = {
    info: 'var(--text-primary)',
    warning: 'var(--ft-accent)',
    success: 'var(--ft-primary)',
    error: 'var(--danger)',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[9998]"
        onClick={config.announcement.dismissible ? handleDismiss : undefined}
      />
      {/* Popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="rounded-lg shadow-[0_24px_48px_var(--shadow)] max-w-lg w-full border-l-4"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderLeftColor: borderColors[config.announcement.type] || borderColors.info,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <h2 className="ds-title text-[2rem]">
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
