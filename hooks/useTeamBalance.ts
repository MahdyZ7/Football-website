/**
 * Custom hook for team balancing algorithm
 * Single Responsibility: Implement snake draft algorithm for fair team distribution
 *
 * Handles:
 * - Snake draft algorithm for 2 teams (10 players each)
 * - Snake draft algorithm for 3 teams (7 players each)
 * - Player sorting by rating
 * - Optimal team distribution
 *
 * Extracted from TeamsImproved component to separate balancing logic
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

interface BalanceResult {
  team1: Team;
  team2: Team;
  team3: Team;
  remaining: User[];
}

interface UseTeamBalanceReturn {
  autoBalance: (
    availablePlayers: User[],
    currentTeams: { team1: Team; team2: Team; team3: Team }
  ) => BalanceResult;
}

export function useTeamBalance(teamMode: 2 | 3): UseTeamBalanceReturn {
  /**
   * Auto-balance teams using snake draft algorithm
   *
   * Snake draft ensures fair distribution by reversing pick order each round:
   * - 2 teams: Round 1 (A, B), Round 2 (B, A), Round 3 (A, B), etc.
   * - 3 teams: Round 1 (A, B, C), Round 2 (C, B, A), Round 3 (A, B, C), etc.
   *
   * Players are sorted by rating (highest first) before drafting begins.
   * Random first pick prevents the same team from always getting best player.
   */
  const autoBalance = (
    availablePlayers: User[],
    currentTeams: { team1: Team; team2: Team; team3: Team }
  ): BalanceResult => {
    // Combine all players and sort by rating (highest first)
    const allEligiblePlayers = [
      ...availablePlayers,
      ...currentTeams.team1.players,
      ...currentTeams.team2.players,
      ...currentTeams.team3.players,
    ];
    const sortedPlayers = allEligiblePlayers.sort(
      (a, b) => (b.rating || 1) - (a.rating || 1)
    );

    if (teamMode === 2) {
      return balance2Teams(sortedPlayers, currentTeams);
    } else {
      return balance3Teams(sortedPlayers, currentTeams);
    }
  };

  /**
   * Balance algorithm for 2 teams (10 players each)
   *
   * Uses snake draft:
   * - Even rounds: Team A picks first, then Team B
   * - Odd rounds: Team B picks first, then Team A
   * - Randomizes which team gets first pick overall
   */
  const balance2Teams = (
    sortedPlayers: User[],
    currentTeams: { team1: Team; team2: Team; team3: Team }
  ): BalanceResult => {
    const teams: User[][] = [[], []];
    const randomFirstPick = Math.floor(Math.random() * 2);
    const pickOrder: number[] = [];

    // Build pick order for 10 rounds (20 players total)
    for (let round = 0; round < 10; round++) {
      if (round % 2 === 0) {
        // Even round: first picker goes first
        pickOrder.push(randomFirstPick, (randomFirstPick + 1) % 2);
      } else {
        // Odd round: reverse order (snake draft)
        pickOrder.push((randomFirstPick + 1) % 2, randomFirstPick);
      }
    }

    // Assign players to teams according to pick order
    sortedPlayers.slice(0, 20).forEach((player, index) => {
      teams[pickOrder[index]].push(player);
    });

    return {
      team1: { name: currentTeams.team1.name, players: teams[0] },
      team2: { name: currentTeams.team2.name, players: teams[1] },
      team3: { name: currentTeams.team3.name, players: [] },
      remaining: sortedPlayers.slice(20),
    };
  };

  /**
   * Balance algorithm for 3 teams (7 players each)
   *
   * Uses snake draft:
   * - Even rounds: Team A, Team B, Team C
   * - Odd rounds: Team C, Team B, Team A (reversed)
   * - Randomizes which team gets first pick overall
   */
  const balance3Teams = (
    sortedPlayers: User[],
    currentTeams: { team1: Team; team2: Team; team3: Team }
  ): BalanceResult => {
    const teams: User[][] = [[], [], []];
    const randomFirstPick = Math.floor(Math.random() * 3);
    const pickOrder: number[] = [];

    // Build pick order for 7 rounds (21 players total)
    for (let round = 0; round < 7; round++) {
      if (round % 2 === 0) {
        // Even round: normal order starting from random first pick
        pickOrder.push(
          randomFirstPick,
          (randomFirstPick + 1) % 3,
          (randomFirstPick + 2) % 3
        );
      } else {
        // Odd round: reverse order (snake draft)
        pickOrder.push(
          (randomFirstPick + 2) % 3,
          (randomFirstPick + 1) % 3,
          randomFirstPick
        );
      }
    }

    // Assign players to teams according to pick order
    sortedPlayers.slice(0, 21).forEach((player, index) => {
      teams[pickOrder[index]].push(player);
    });

    return {
      team1: { name: currentTeams.team1.name, players: teams[0] },
      team2: { name: currentTeams.team2.name, players: teams[1] },
      team3: { name: currentTeams.team3.name, players: teams[2] },
      remaining: sortedPlayers.slice(21),
    };
  };

  return {
    autoBalance,
  };
}
