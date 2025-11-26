import React from 'react';

/**
 * BanRulesTable Component
 * Single Responsibility: Display TIG ban rules in a table format
 */
export function BanRulesTable() {
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
                One week (or Two weeks if on game day after 5 PM)
              </td>
            </tr>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Not ready when booking time starts
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                Half a week
              </td>
            </tr>
            <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Late {">"} 15 minutes
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                One week
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                No Show without notice
              </td>
              <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                Four weeks
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          <strong>Note:</strong> You can remove your registration without a ban within 15 minutes of registering.
        </p>
      </div>
    </div>
  );
}
