import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { StaticImageData } from 'next/image';

type Team = {
  id: string;
  name: string;
  founded: string;
  colors: {
    primary: string;
    accent: string;
    text: string;
    secondaryText: string;
  };
  font: string;
  image: StaticImageData;
  players: { number: number; name: string; position: string }[];
  theme: string;
};

/**
 * Custom hook for loading team data from URL parameters
 * Single Responsibility: Parse and load team data from URL query params
 *
 * Extracted from RosterContent component to separate URL parsing logic
 */
export function useTeamsFromUrl(defaultTeams: Team[]) {
  const searchParams = useSearchParams();
  const teamsData = searchParams.get('teams');

  return useMemo<Team[]>(() => {
    if (!teamsData) return defaultTeams;
    try {
      const parsedTeams = JSON.parse(decodeURIComponent(teamsData));
      return defaultTeams.slice(0, parsedTeams.length).map((defaultTeam: Team, index: number) => {
        const incomingTeam = parsedTeams[index];
        const players = incomingTeam.players.map(
          (player: { name: string; intra: string }, playerIndex: number) => ({
            number: playerIndex + 1,
            name: player.name.toUpperCase(),
            position: player.intra.toUpperCase(),
          })
        );
        return { ...defaultTeam, players };
      });
    } catch (error) {
      console.error('Failed to parse teams data:', error);
      return defaultTeams;
    }
  }, [teamsData, defaultTeams]);
}
