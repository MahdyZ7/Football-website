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
};

type Team = {
  name: string;
  players: User[];
};

interface UseTeamManagementProps {
  registeredUsers: User[];
  teamMode: 2 | 3;
  guaranteedSpot: number;
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
}: UseTeamManagementProps): UseTeamManagementReturn {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>([]);
  const [waitingListPlayers, setWaitingListPlayers] = useState<User[]>([]);
  const [discardedPlayers, setDiscardedPlayers] = useState<User[]>([]);
  const [team1, setTeam1] = useState<Team>({ name: 'Team 1', players: [] });
  const [team2, setTeam2] = useState<Team>({ name: 'Team 2', players: [] });
  const [team3, setTeam3] = useState<Team>({ name: 'Team 3', players: [] });

  // Initialize available and waiting list players from registered users
  useEffect(() => {
    if (registeredUsers.length > 0) {
      // Initialize available players and waiting list from registered users.
      // Do NOT read sessionStorage here — letting the page-level
      // `useSessionStorage` restore full state prevents race conditions
      // between this hook and the consumer component.
      const activePlayers = registeredUsers.filter(u => !('is_banned' in u && u.is_banned));
      const eligiblePlayers = activePlayers
        .slice(0, guaranteedSpot)
        .map(user => ({ ...user, rating: 1 }));
      const waitingPlayers = activePlayers.slice(guaranteedSpot);

      setAvailablePlayers(eligiblePlayers);
      setWaitingListPlayers(waitingPlayers);
    }
  }, [registeredUsers, guaranteedSpot]);

  /**
   * Add a player to a specific team
   * Respects team capacity limits (10 for 2-team mode, 7 for 3-team mode)
   */
  const addToTeam = (player: User, teamNumber: 1 | 2 | 3) => {
    const targetTeam = teamNumber === 1 ? team1 : teamNumber === 2 ? team2 : team3;
    const maxPlayersPerTeam = teamMode === 2 ? 10 : 7;

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
      .slice(0, guaranteedSpot)
      .map(user => ({
        ...user,
        rating: ratingMap.get(user.intra) || 1,
      }));

    setAvailablePlayers(eligiblePlayers);
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
    const maxPlayersPerTeam = teamMode === 2 ? 10 : 7;
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
