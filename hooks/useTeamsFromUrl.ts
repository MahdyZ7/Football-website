import { useState, useEffect } from 'react';
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
  const [teams, setTeams] = useState<Team[]>(defaultTeams);

  useEffect(() => {
    const teamsData = searchParams.get('teams');
    if (teamsData) {
      try {
        const parsedTeams = JSON.parse(decodeURIComponent(teamsData));

        // Map the incoming teams to the roster format
        const updatedTeams = defaultTeams.slice(0, parsedTeams.length).map((defaultTeam: Team, index: number) => {
          const incomingTeam = parsedTeams[index];

          // Create player objects with intra as position
          const players = incomingTeam.players.map((player: any, playerIndex: number) => ({
            number: playerIndex + 1,
            name: player.name.toUpperCase(),
            position: player.intra.toUpperCase()
          }));

          return {
            ...defaultTeam,
            players: players
            // Keep the original team name from defaultTeams, not from incoming data
          };
        });

        setTeams(updatedTeams);
      } catch (error) {
        console.error("Failed to parse teams data:", error);
        // Keep default teams on parse error
      }
    }
  }, [searchParams, defaultTeams]);

  return teams;
}
