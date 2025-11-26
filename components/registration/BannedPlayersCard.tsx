import React from 'react';
import Link from 'next/link';

/**
 * BannedPlayersCard Component
 * Single Responsibility: Display banned players card with link
 */
export function BannedPlayersCard() {
  return (
    <div
      className="max-w-4xl mx-auto mb-12 rounded-lg shadow-md overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
          Banned Players
        </h3>
      </div>
      <div className="px-6 py-8">
        <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
          Players currently banned from registering
        </p>
        <div className="text-center">
          <Link
            href="/banned-players"
            className="inline-block px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white
                       font-semibold rounded transition-all duration-200 transform hover:scale-105"
          >
            View Banned Players List
          </Link>
        </div>
      </div>
    </div>
  );
}
