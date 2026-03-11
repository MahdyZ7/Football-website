import { useState, useEffect } from 'react';

/**
 * Custom hook for team management
 * Single Responsibility: Manage team state and player assignments
 *
 * Handles:
 * - Team rosters (team1, team2, team3)
 * - Player assignment to teams
 * - Player removal from teams
 * - Available players list management
 * - Discarded players tracking
 * - Team statistics calculation
 *
 * Extracted from TeamsImproved component to separate business logic
 */

type User = {
  name: string;
  intra: string;
  verified: boolean;
  created_at: string;
  rating?: number;
  registration_status?: 'confirmed' | 'waitlisted';
  waitlist_position?: number | null;
};

type Team = {
  name: string;
  players: User[];
};

interface UseTeamManagementProps {
  registeredUsers: User[];
  teamMode: 2 | 3;
  guaranteedSpot: number;
  playersPerTeam2Mode?: number;
  playersPerTeam3Mode?: number;
}

interface UseTeamManagementReturn {
  // State
  team1: Team;
  team2: Team;
  team3: Team;
  availablePlayers: User[];
  discardedPlayers: User[];
  waitingListPlayers: User[];

  // Actions
  addToTeam: (player: User, teamNumber: 1 | 2 | 3) => void;
  removeFromTeam: (player: User, teamNumber: 1 | 2 | 3) => void;
  discardPlayer: (player: User) => void;
  reAddPlayer: (player: User) => void;
  clearTeams: () => void;
  updateTeamName: (teamNumber: 1 | 2 | 3, newName: string) => void;
  setAvailablePlayers: React.Dispatch<React.SetStateAction<User[]>>;
  setTeam1: React.Dispatch<React.SetStateAction<Team>>;
  setTeam2: React.Dispatch<React.SetStateAction<Team>>;
  setTeam3: React.Dispatch<React.SetStateAction<Team>>;

  // Computed
  getTeamStats: (team: Team) => { avgRating: string; count: number };
  isTeamFull: (teamNumber: 1 | 2 | 3) => boolean;
}

export function useTeamManagement({
  registeredUsers,
  teamMode,
  guaranteedSpot,
  playersPerTeam2Mode = 10,
  playersPerTeam3Mode = 7,
}: UseTeamManagementProps): UseTeamManagementReturn {
  const maxPlayersPerTeam = teamMode === 2 ? playersPerTeam2Mode : playersPerTeam3Mode;
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [waitingListPlayers, setWaitingListPlayers] = useState<User[]>([]);
  const [discardedPlayers, setDiscardedPlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: 'Team 1', players: [] });
  const [team2, setTeam2] = useState<Team>({ name: 'Team 2', players: [] });
  const [team3, setTeam3] = useState<Team>({ name: 'Team 3', players: [] });

  const playersEqual = (left: User[], right: User[]) =>
    left.length === right.length &&
    left.every((player, index) => {
      const comparison = right[index];
      return (
        player.intra === comparison?.intra &&
        (player.rating || 1) === (comparison?.rating || 1) &&
        player.name === comparison?.name &&
        (player.waitlist_position ?? null) === (comparison?.waitlist_position ?? null) &&
        (player.registration_status ?? 'confirmed') === (comparison?.registration_status ?? 'confirmed')
      );
    });

  useEffect(() => {
    const activePlayers = registeredUsers.filter(u => !('is_banned' in u && u.is_banned));
    const ratingMap = new Map<string, number>();

    [...availablePlayers, ...discardedPlayers, ...team1.players, ...team2.players, ...team3.players].forEach((player) => {
      ratingMap.set(player.intra, player.rating || 1);
    });

    const confirmedPlayers = activePlayers
      .filter(user => (user.registration_status ?? 'confirmed') === 'confirmed')
      .slice(0, guaranteedSpot)
      .map(user => ({ ...user, rating: ratingMap.get(user.intra) || 1 }));
    const confirmedByIntra = new Map(confirmedPlayers.map((player) => [player.intra, player]));

    const syncConfirmedPlayers = (players: User[]) =>
      players
        .filter(player => confirmedByIntra.has(player.intra))
        .map(player => ({
          ...confirmedByIntra.get(player.intra)!,
          rating: player.rating || confirmedByIntra.get(player.intra)!.rating || 1,
        }));

    const nextTeam1Players = syncConfirmedPlayers(team1.players);
    const nextTeam2Players = syncConfirmedPlayers(team2.players);
    const nextTeam3Players = syncConfirmedPlayers(team3.players);
    const nextDiscardedPlayers = syncConfirmedPlayers(discardedPlayers);

    const reservedIntras = new Set([
      ...nextTeam1Players.map(player => player.intra),
      ...nextTeam2Players.map(player => player.intra),
      ...nextTeam3Players.map(player => player.intra),
      ...nextDiscardedPlayers.map(player => player.intra),
    ]);

    const nextAvailablePlayers = [
      ...availablePlayers
        .filter(player => confirmedByIntra.has(player.intra) && !reservedIntras.has(player.intra))
        .map(player => ({
          ...confirmedByIntra.get(player.intra)!,
          rating: player.rating || confirmedByIntra.get(player.intra)!.rating || 1,
        })),
      ...confirmedPlayers.filter(
        player =>
          !reservedIntras.has(player.intra) &&
          !availablePlayers.some(existing => existing.intra === player.intra)
      ),
    ];

    const waitingPlayers = activePlayers
      .filter(user => user.registration_status === 'waitlisted')
      .sort((a, b) => (a.waitlist_position ?? Number.MAX_SAFE_INTEGER) - (b.waitlist_position ?? Number.MAX_SAFE_INTEGER));

    if (!playersEqual(team1.players, nextTeam1Players)) {
      setTeam1(prev => ({ ...prev, players: nextTeam1Players }));
    }
    if (!playersEqual(team2.players, nextTeam2Players)) {
      setTeam2(prev => ({ ...prev, players: nextTeam2Players }));
    }
    if (!playersEqual(team3.players, nextTeam3Players)) {
      setTeam3(prev => ({ ...prev, players: nextTeam3Players }));
    }
    if (!playersEqual(discardedPlayers, nextDiscardedPlayers)) {
      setDiscardedPlayers(nextDiscardedPlayers);
    }
    if (!playersEqual(availablePlayers, nextAvailablePlayers)) {
      setAvailablePlayers(nextAvailablePlayers);
    }
    if (!playersEqual(waitingListPlayers, waitingPlayers)) {
      setWaitingListPlayers(waitingPlayers);
    }
  }, [registeredUsers, guaranteedSpot, availablePlayers, discardedPlayers, team1.players, team2.players, team3.players, waitingListPlayers]);

  /**
   * Add a player to a specific team
   * Respects team capacity limits (10 for 2-team mode, 7 for 3-team mode)
   */
  const addToTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    const targetTeam = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;
        if (targetTeam.players.length >= maxPlayersPerTeam) return;
    if (teamNumber === 3 && teamMode === 2) return;

    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, players: [...prev.players, player] }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, players: [...prev.players, player] }));
    } else {
      setTeam3(prev => ({ ...prev, players: [...prev.players, player] }));
    }
    setAvailablePlayers(prev => prev.filter(p => p.intra !== player.intra));
  };

  /**
   * Remove a player from a specific team
   * Returns the player to the available players list
   */
  const removeFromTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({
        ...prev,
        players: prev.players.filter(p => p.intra !== player.intra),
      }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({
        ...prev,
        players: prev.players.filter(p => p.intra !== player.intra),
      }));
    } else {
      setTeam3(prev => ({
        ...prev,
        players: prev.players.filter(p => p.intra !== player.intra),
      }));
    }
    setAvailablePlayers(prev => [...prev, player]);
  };

  /**
   * Discard a player (didn't show up)
   * Moves them to discarded list and attempts to promote a waiting list player
   */
  const discardPlayer = (player: User) => {
    setAvailablePlayers(prev => prev.filter(p => p.intra !== player.intra));
    setDiscardedPlayers(prev => [...prev, player]);

    // Try to move first waiting list player to available if there's space
    if (waitingListPlayers.length > 0) {
      const nextPlayer = waitingListPlayers[0];
      setWaitingListPlayers(prev => prev.slice(1));
      setAvailablePlayers(prev => [
        ...prev.filter(p => p.intra !== player.intra),
        { ...nextPlayer, rating: 1 },
      ]);
    }
  };

  /**
   * Re-add a discarded player back to available players
   */
  const reAddPlayer = (player: User) => {
    setDiscardedPlayers(prev => prev.filter(p => p.intra !== player.intra));
    setAvailablePlayers(prev => [...prev, player]);
  };

  /**
   * Clear all teams and reset to initial state
   * Preserves player ratings from current session
   */
  const clearTeams = () => {
    const allCurrentPlayers = [
      ...availablePlayers,
      ...team1.players,
      ...team2.players,
      ...team3.players,
      ...discardedPlayers,
    ];
    const ratingMap = new Map<string, number>();
    allCurrentPlayers.forEach(player => {
      ratingMap.set(player.intra, player.rating || 1);
    });

    const activePlayersForReset = registeredUsers.filter(u => !('is_banned' in u && u.is_banned));
    const eligiblePlayers = activePlayersForReset
      .filter(user => (user.registration_status ?? 'confirmed') === 'confirmed')
      .slice(0, guaranteedSpot)
      .map(user => ({
        ...user,
        rating: ratingMap.get(user.intra) || 1,
      }));

    setAvailablePlayers(eligiblePlayers);
    setWaitingListPlayers(
      activePlayersForReset
        .filter(user => user.registration_status === 'waitlisted')
        .sort((a, b) => (a.waitlist_position ?? Number.MAX_SAFE_INTEGER) - (b.waitlist_position ?? Number.MAX_SAFE_INTEGER))
    );
    setTeam1({ name: 'Team 1', players: [] });
    setTeam2({ name: 'Team 2', players: [] });
    setTeam3({ name: 'Team 3', players: [] });
    setDiscardedPlayers([]);

    // Clear saved state
    sessionStorage.removeItem('teamSelectionState');
  };

  /**
   * Update the name of a specific team
   */
  const updateTeamName = (teamNumber: 1 | 2 | 3, newName: string) => {
    if (teamNumber === 1) {
      setTeam1(prev => ({ ...prev, name: newName }));
    } else if (teamNumber === 2) {
      setTeam2(prev => ({ ...prev, name: newName }));
    } else {
      setTeam3(prev => ({ ...prev, name: newName }));
    }
  };

  /**
   * Calculate team statistics (average rating and player count)
   */
  const getTeamStats = (team: Team) => {
    const avgRating =
      team.players.length > 0
        ? (
            team.players.reduce((sum, p) => sum + (p.rating || 1), 0) /
            team.players.length
          ).toFixed(1)
        : '0';
    return { avgRating, count: team.players.length };
  };

  /**
   * Check if a team is at full capacity
   */
  const isTeamFull = (teamNumber: 1 | 2 | 3): boolean => {
    const team = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;
    return team.players.length >= maxPlayersPerTeam;
  };

  return {
    // State
    team1,
    team2,
    team3,
    availablePlayers,
    discardedPlayers,
    waitingListPlayers,

    // Actions
    addToTeam,
    removeFromTeam,
    discardPlayer,
    reAddPlayer,
    clearTeams,
    updateTeamName,
    setAvailablePlayers,
    setTeam1,
    setTeam2,
    setTeam3,

    // Computed
    getTeamStats,
    isTeamFull,
  };
}
