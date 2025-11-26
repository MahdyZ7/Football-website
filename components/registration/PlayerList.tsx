import React from 'react';
import { useSession } from 'next-auth/react';
import { User } from '../../types/user';
import { PlayerCard } from './PlayerCard';
import { PlayerListSkeleton } from '../Skeleton';

const GUARANTEED_SPOT = 21;

interface PlayerListProps {
  users: User[];
  loading: boolean;
  error: any;
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

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
        Player List
      </h2>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mb-6 rounded-xl shadow-lg overflow-hidden transition-all duration-300
        bg-gradient-to-b from-stone-700 to-zinc-700">
        <div className="bg-white/20 backdrop-blur-sm text-center rounded-lg px-4 py-2 text-white">
          <div className="text-2xl font-bold">{users.length}/{GUARANTEED_SPOT}</div>
          <div className="text-xs">Spots Filled</div>
        </div>
        <div className="bg-black/50 h-2 mb-6">
          <div
            className="bg-white/50 h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min((users.length / GUARANTEED_SPOT) * 100, 100)}%` }}
            role="progressbar"
            aria-valuenow={users.length}
            aria-valuemin={0}
            aria-valuemax={GUARANTEED_SPOT}
            aria-label={`${users.length} out of ${GUARANTEED_SPOT} spots filled`}
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
          ) : users.length === 0 ? (
            <div className="col-span-full text-center py-12 text-red-600 font-bold text-xl">
              Dare to be First
            </div>
          ) : (
            users.map((user, index) => {
              const isOwnRegistration = session && user.user_id && user.user_id === session.user.id;
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
