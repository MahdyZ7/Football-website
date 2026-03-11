'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { usePlayerHistory } from '../../hooks/useQueries';
import { Skeleton } from '../Skeleton';

const EVENT_LABELS: Record<string, string> = {
  registration_confirmed: 'Confirmed Registration',
  registration_waitlisted: 'Joined Waitlist',
  waitlist_promoted: 'Promoted From Waitlist',
  self_cancel: 'Cancellation',
  late: 'Late Arrival',
  no_show: 'No Show',
  admin_removed: 'Removed By Admin',
  ban_applied: 'Ban Applied',
  ban_removed: 'Ban Removed',
};

export function MyPlayerHistory() {
  const { status } = useSession();
  const { data, isLoading, error } = usePlayerHistory(status === 'authenticated');

  if (status !== 'authenticated') {
    return null;
  }

  return (
    <section
      className="max-w-4xl mx-auto mb-12 rounded-lg shadow-md overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)' }}
    >
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          My Football History
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Skeleton width="60%" height={20} />
                <div className="mt-2 space-y-1">
                  <Skeleton width="80%" height={16} />
                  <Skeleton width="50%" height={16} />
                </div>
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <Skeleton width="50%" height={20} />
                <div className="mt-2"><Skeleton width="70%" height={16} /></div>
              </div>
            </div>
            <Skeleton width="40%" height={20} />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <Skeleton width="60%" height={16} />
                  <div className="mt-1"><Skeleton width="40%" height={14} /></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <p className="text-red-600">Failed to load your player history.</p>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Current Registration</h4>
                {data?.currentRegistration ? (
                  <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p>{data.currentRegistration.name} ({data.currentRegistration.intra})</p>
                    <p>
                      {data.currentRegistration.registration_status === 'confirmed'
                        ? 'Confirmed spot'
                        : `Waitlist #${data.currentRegistration.waitlist_position ?? '-'}`}
                    </p>
                    <p>Registered on {new Date(data.currentRegistration.created_at).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active registration.</p>
                )}
              </div>
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <h4 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Ban Status</h4>
                {data?.activeBan ? (
                  <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p>{data.activeBan.reason}</p>
                    <p>Expires {new Date(data.activeBan.banned_until).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No active ban.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Reliability History</h4>
              <div className="space-y-2">
                {data?.reliabilityEvents?.length ? data.reliabilityEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg p-3 text-sm flex items-center justify-between gap-4"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {EVENT_LABELS[event.event_type] || event.event_type}
                      </p>
                      {event.reason && <p>{event.reason}</p>}
                    </div>
                    <div className="text-right">
                      <p>{new Date(event.created_at).toLocaleDateString()}</p>
                      {event.related_ban_until && <p>Ban until {new Date(event.related_ban_until).toLocaleDateString()}</p>}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No reliability events yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
