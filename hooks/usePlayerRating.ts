import React from 'react';

/**
 * Custom hook for managing player ratings
 * Single Responsibility: Update and sync player ratings across all lists
 *
 * Handles:
 * - Updating individual player ratings
 * - Syncing ratings across available players and all teams
 * - Ensuring rating consistency throughout the application
 *
 * Extracted from TeamsImproved component to separate rating logic
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

interface UsePlayerRatingProps {
  availablePlayers: User[];
  team1: Team;
  team2: Team;
  team3: Team;
  setAvailablePlayers: React.Dispatch<React.SetStateAction<User[]>>;
  setTeam1: React.Dispatch<React.SetStateAction<Team>>;
  setTeam2: React.Dispatch<React.SetStateAction<Team>>;
  setTeam3: React.Dispatch<React.SetStateAction<Team>>;
}

interface UsePlayerRatingReturn {
  updatePlayerRating: (playerId: string, rating: number) => void;
  getPlayerRating: (playerId: string) => number;
}

export function usePlayerRating({
  availablePlayers,
  team1,
  team2,
  team3,
  setAvailablePlayers,
  setTeam1,
  setTeam2,
  setTeam3,
}: UsePlayerRatingProps): UsePlayerRatingReturn {
  /**
   * Update a player's rating across all lists
   *
   * This function ensures rating consistency by updating the player's rating
   * in whichever list they appear (available players or any team).
   *
   * @param playerId - The player's intra username
   * @param rating - New rating value (1-5 stars)
   */
  const updatePlayerRating = (playerId: string, rating: number) => {
    // Helper function to update rating in a list of players
    const updateInList = (players: User[]) =>
      players.map(player =>
        player.intra === playerId ? { ...player, rating } : player
      );

    // Update available players list
    setAvailablePlayers(updateInList);

    // Update all team rosters
    setTeam1(prev => ({ ...prev, players: updateInList(prev.players) }));
    setTeam2(prev => ({ ...prev, players: updateInList(prev.players) }));
    setTeam3(prev => ({ ...prev, players: updateInList(prev.players) }));
  };

  /**
   * Get a player's current rating
   *
   * Searches for the player across available players and all teams
   * to retrieve their current rating.
   *
   * @param playerId - The player's intra username
   * @returns The player's rating (1-5), or 1 if player not found
   */
  const getPlayerRating = (playerId: string): number => {
    // Check available players
    const availablePlayer = availablePlayers.find(p => p.intra === playerId);
    if (availablePlayer) {
      return availablePlayer.rating || 1;
    }

    // Check all teams
    const allTeamPlayers = [
      ...team1.players,
      ...team2.players,
      ...team3.players,
    ];
    const teamPlayer = allTeamPlayers.find(p => p.intra === playerId);
    if (teamPlayer) {
      return teamPlayer.rating || 1;
    }

    // Default rating if player not found
    return 1;
  };

  return {
    updatePlayerRating,
    getPlayerRating,
  };
}
