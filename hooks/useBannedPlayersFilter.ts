import { useMemo } from 'react';

interface BannedUser {
  intra: string;
  name: string;
  reason: string;
  banned_at: string;
  banned_until: string;
  user_id?: string;
}

/**
 * Custom hook for filtering and managing banned players
 * Single Responsibility: Filter banned users and provide date utilities
 *
 * Extracted from BannedPlayersPage component to separate filtering logic
 */
export function useBannedPlayersFilter(bannedUsers: BannedUser[]) {
  /**
   * Check if a ban has expired
   */
  const isExpired = (bannedUntil: string) => {
    return new Date(bannedUntil) < new Date();
  };

  /**
   * Format date string to readable format
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Filter banned users into active and expired categories
   */
  const { activeBans, expiredBans } = useMemo(() => {
    const active = bannedUsers.filter(user => !isExpired(user.banned_until));
    const expired = bannedUsers.filter(user => isExpired(user.banned_until));

    return {
      activeBans: active,
      expiredBans: expired
    };
  }, [bannedUsers]);

  return {
    activeBans,
    expiredBans,
    formatDate
  };
}
