import React from 'react';
import { useSession } from 'next-auth/react';
import { User } from '../../types/user';
import { PlayerCard } from './PlayerCard';
import { PlayerListSkeleton } from '../Skeleton';
import { useConfig } from '../../contexts/SiteConfigContext';

interface PlayerListProps {
  users: User[];
  loading: boolean;
  error: Error | null;
  onRemove: (intra: string) => void;
  onEditName: (intra: string, currentName: string) => void;
}

/**
 * PlayerList Component
 * Single Responsibility: Display the list of registered players with progress indicator
 */
export function PlayerList({
  users,
  loading,
  error,
  onRemove,
  onEditName
}: PlayerListProps) {
  const { data: session } = useSession();
  const { config } = useConfig();
  const guaranteedSpots = config.guaranteedSpots;

  // Filter out banned players — they don't appear and don't count toward spots
  const visibleUsers = users.filter(u => !u.is_banned);
  const confirmedUsers = visibleUsers.filter(u => (u.registration_status ?? 'confirmed') === 'confirmed');

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
        Player List
      </h2>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mb-6 rounded-xl shadow-lg overflow-hidden transition-all duration-300
        bg-gradient-to-b from-stone-700 to-zinc-700">
        <div className="bg-white/20 backdrop-blur-sm text-center rounded-lg px-4 py-2 text-white">
          <div className="text-2xl font-bold">{visibleUsers.length}/{guaranteedSpots}</div>
          <div className="text-xs">{confirmedUsers.length} confirmed, {visibleUsers.length - confirmedUsers.length} waitlisted</div>
        </div>
        <div className="bg-black/50 h-2 mb-6">
          <div
            className="bg-white/50 h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((confirmedUsers.length / guaranteedSpots) * 100, 100)}%` }}
            role="progressbar"
            aria-valuenow={confirmedUsers.length}
            aria-valuemin={0}
            aria-valuemax={guaranteedSpots}
            aria-label={`${confirmedUsers.length} out of ${guaranteedSpots} confirmed spots filled`}
          />
        </div>
      </div>

      {/* Player Cards */}
      {loading ? (
        <PlayerListSkeleton count={21} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {error ? (
            <div className="col-span-full text-center py-8 text-red-600 font-medium" role="alert">
              Error loading players. Please refresh the page.
            </div>
          ) : visibleUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-red-600 font-bold text-xl">
              Dare to be First
            </div>
          ) : (
            visibleUsers.map((user, index) => {
              const isOwnRegistration = !!session && !!user.owned_by_current_user;
              const isAdmin = session?.user?.isAdmin || false;

              return (
                <PlayerCard
                  key={user.intra}
                  user={user}
                  index={index}
                  isOwnRegistration={!!isOwnRegistration}
                  isAdmin={isAdmin}
                  onRemove={onRemove}
                  onEditName={onEditName}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
