// Tournament voting constants - shared between frontend and API

export const TOURNAMENT_TEAMS = {
  Falcon: { name: "Falcon", color: "#fe6640", logo: "/teams/falcon.png" },
  Leopard: { name: "Leopard", color: "#7111f8", logo: "/teams/leopard.png" },
  Oryx: { name: "Oryx", color: "#01eafa", logo: "/teams/oryx.png" },
  Wolves: { name: "Wolves", color: "#424242", logo: "/teams/wolves.png" },
} as const;

export type TeamKey = keyof typeof TOURNAMENT_TEAMS;

export interface EligiblePlayer {
  name: string;
  team: TeamKey;
}

// List of eligible players for "Best Player" award
export const ELIGIBLE_PLAYERS: EligiblePlayer[] = [
  { name: "Zubidullah", team: "Falcon" },
  { name: "Moh'd Alfaqih", team: "Wolves" },
  { name: "Hadi", team: "Wolves" },
  { name: "Hackeem", team: "Oryx" },
  { name: "Haitham", team: "Oryx" },
  { name: "Zoir", team: "Oryx" },
  { name: "Moh'd Shahan", team: "Wolves" },
  { name: "Omar", team: "Leopard" },
  { name: "Moh'd Eid", team: "Falcon" },
  { name: "Fahim", team: "Falcon" },
  { name: "Ahmed Kanbari", team: "Falcon" },
  { name: "Akram", team: "Leopard" },
  { name: "Anas", team: "Leopard" },
  { name: "Abdulla Rashidov", team: "Leopard" },
  { name: "Khalil", team: "Oryx" },
  { name: "Zeniman", team: "Wolves" },
];

// List of eligible goalkeepers for "Best Goalkeeper" award
export const ELIGIBLE_GOALKEEPERS: EligiblePlayer[] = [
  { name: "Hadi", team: "Wolves" },
  { name: "Ulugbek", team: "Oryx" },
  { name: "Tammem", team: "Falcon" },
  { name: "Ahmad", team: "Leopard" },
];

// Voting deadline: Sunday 12:00 PM (noon) Abu Dhabi time (UTC+4)
// Set to the next upcoming Sunday at 12:00 PM Abu Dhabi time
export const VOTING_DEADLINE = new Date('2026-01-26T12:00:00+04:00');

// Helper function to check if voting is still open
export function isVotingOpen(): boolean {
  return new Date() < VOTING_DEADLINE;
}

// Helper function to get time remaining until deadline
export function getTimeRemaining(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
  isExpired: boolean;
} {
  const now = new Date().getTime();
  const deadline = VOTING_DEADLINE.getTime();
  const total = deadline - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true };
  }

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    total,
    isExpired: false,
  };
}

// Helper to find eligible player (case-insensitive)
export function findEligiblePlayer(
  playerName: string,
  playerTeam: string,
  awardType: 'best_player' | 'best_goalkeeper'
): EligiblePlayer | undefined {
  const eligibleList = awardType === 'best_goalkeeper' ? ELIGIBLE_GOALKEEPERS : ELIGIBLE_PLAYERS;
  return eligibleList.find(
    p => p.name.toLowerCase() === playerName.toLowerCase() &&
         p.team.toLowerCase() === playerTeam.toLowerCase()
  );
}
