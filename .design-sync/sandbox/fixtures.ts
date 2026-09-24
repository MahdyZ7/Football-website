// Demo data served to the app's React Query hooks inside DesignSandbox.
// Shapes mirror the app/api/* route handlers; names come from
// scripts/seed-dev-data.ts and lib/constants/tournament.ts.
import type { User, BannedUser, AdminLog, PlayerHistoryResponse } from '../../types/user';
import { DEFAULT_CONFIG, type SiteConfig } from '../../lib/config/defaults';

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
const ahead = (ms: number) => new Date(Date.now() + ms).toISOString();

const SEED_PLAYERS: Array<[string, string]> = [
  ['John Doe', 'jdoe'], ['Jane Smith', 'jsmith'], ['Michael Johnson', 'mjohnson'],
  ['Emily Davis', 'edavis'], ['David Wilson', 'dwilson'], ['Sarah Miller', 'smiller'],
  ['James Brown', 'jbrown'], ['Lisa Anderson', 'landerson'], ['Robert Taylor', 'rtaylor'],
  ['Maria Garcia', 'mgarcia'], ['Thomas Martinez', 'tmartinez'], ['Jennifer Lee', 'jlee'],
  ['Christopher White', 'cwhite'], ['Amanda Harris', 'aharris'], ['Daniel Clark', 'dclark'],
  ['Jessica Lewis', 'jlewis'], ['Matthew Robinson', 'mrobinson'], ['Ashley Walker', 'awalker'],
  ['Omar Haddad', 'ohaddad'], ['Khalil Nasser', 'knasser'], ['Hadi Mansour', 'hmansour'],
  ['Anas Karim', 'akarim'], ['Zoir Tashkentov', 'ztashken'], ['Akram Saleh', 'asaleh'],
];

export const DEMO_PLAYER_INTRA = 'jdoe';

export function users(currentIntra: string | null): User[] {
  return SEED_PLAYERS.map(([name, intra], i) => {
    const waitlisted = i >= 21;
    return {
      name,
      intra,
      verified: i < 15 || waitlisted,
      created_at: ago((30 - i) * HOUR + i * 7 * 60_000),
      is_banned: false,
      registration_status: waitlisted ? 'waitlisted' : 'confirmed',
      waitlist_position: waitlisted ? i - 20 : null,
      promoted_at: null,
      owned_by_current_user: currentIntra === intra,
    };
  });
}

export const bannedUsers = (): BannedUser[] => [
  { intra: 'rkhan', name: 'Rashid Khan', reason: 'No show without notice', banned_at: ago(3 * DAY), banned_until: ahead(27 * DAY), user_id: 'u-rkhan' },
  { intra: 'pmorris', name: 'Paul Morris', reason: 'Cancelled on game day', banned_at: ago(2 * DAY), banned_until: ahead(13 * DAY), user_id: 'u-pmorris' },
  { intra: 'lchen', name: 'Li Chen', reason: 'Late arrival (over 15 minutes)', banned_at: ago(1 * DAY), banned_until: ahead(7 * DAY), user_id: 'u-lchen' },
];

export const adminLogs = (): AdminLog[] => [
  { id: 108, admin_user: 'Admin User', action: 'user_banned', target_user: 'lchen', target_name: 'Li Chen', details: 'Late arrival (over 15 minutes) - 8 days', timestamp: ago(1 * DAY) },
  { id: 107, admin_user: 'Admin User', action: 'user_verified', target_user: 'jlewis', target_name: 'Jessica Lewis', details: 'Verified player identity', timestamp: ago(26 * HOUR) },
  { id: 106, admin_user: 'Service Account', action: 'players_reset', details: 'Weekly roster reset (cron)', timestamp: ago(2 * DAY) },
  { id: 105, admin_user: 'Admin User', action: 'user_banned', target_user: 'pmorris', target_name: 'Paul Morris', details: 'Cancelled on game day - 15 days', timestamp: ago(2 * DAY + 3 * HOUR) },
  { id: 104, admin_user: 'Admin User', action: 'feedback_approved', details: 'Approved: "Show waitlist position on my card"', timestamp: ago(3 * DAY) },
  { id: 103, admin_user: 'Admin User', action: 'user_deleted', target_user: 'user19', target_name: 'Player 19', details: 'Removed duplicate registration', timestamp: ago(3 * DAY + 5 * HOUR) },
  { id: 102, admin_user: 'Admin User', action: 'config_updated', details: 'Changed guaranteedSpots 18 -> 21', timestamp: ago(5 * DAY) },
];

export const playerHistory = (): PlayerHistoryResponse => ({
  currentRegistration: {
    intra: DEMO_PLAYER_INTRA,
    name: 'John Doe',
    registration_status: 'confirmed',
    waitlist_position: null,
    created_at: ago(30 * HOUR),
    promoted_at: null,
  },
  activeBan: null,
  reliabilityEvents: [
    { id: 3, event_type: 'played', reason: null, related_ban_until: null, created_at: ago(4 * DAY) },
    { id: 2, event_type: 'late', reason: 'Arrived 10 minutes after team selection', related_ban_until: null, created_at: ago(11 * DAY) },
    { id: 1, event_type: 'played', reason: null, related_ban_until: null, created_at: ago(18 * DAY) },
  ],
});

const feedbackRows = () => [
  { id: 12, type: 'feature', title: 'Show waitlist position on my card', description: 'When I am on the waitlist I want to see my exact position without scrolling the whole list.', status: 'in_progress', is_approved: true, created_at: ago(6 * DAY), updated_at: ago(3 * DAY), upvotes: 14, downvotes: 1, vote_score: 13 },
  { id: 11, type: 'bug', title: 'Countdown shows negative minutes after registration opens', description: 'For a few seconds after noon the timer shows -0:01 before switching to the form.', status: 'approved', is_approved: true, created_at: ago(8 * DAY), updated_at: ago(7 * DAY), upvotes: 9, downvotes: 0, vote_score: 9 },
  { id: 10, type: 'feedback', title: 'Team balancing has been great lately', description: 'Games feel much more even since the star ratings were added. Thanks!', status: 'completed', is_approved: true, created_at: ago(12 * DAY), updated_at: ago(10 * DAY), upvotes: 6, downvotes: 0, vote_score: 6 },
  { id: 9, type: 'feature', title: 'Export teams as an image for WhatsApp', description: 'A one-tap image of the three teams would make sharing in the group chat easier.', status: 'completed', is_approved: true, created_at: ago(20 * DAY), updated_at: ago(14 * DAY), upvotes: 11, downvotes: 2, vote_score: 9 },
];

export const feedback = () => ({ success: true, submissions: feedbackRows() });

export const adminFeedback = () => ({
  success: true,
  submissions: [
    { id: 13, type: 'bug', title: 'Dark mode toggle resets on refresh', description: 'Switching to dark mode and reloading the page goes back to light.', status: 'pending', is_approved: false, approved_at: null, created_at: ago(5 * HOUR), updated_at: ago(5 * HOUR), submitter_name: 'Emily Davis', submitter_email: 'edavis@student.42.fr', submitter_id: 'u-edavis', approved_by_name: null, upvotes: 0, downvotes: 0, vote_score: 0 },
    ...feedbackRows().map((f) => ({ ...f, approved_at: f.updated_at, submitter_name: 'Jane Smith', submitter_email: 'jsmith@student.42.fr', submitter_id: 'u-jsmith', approved_by_name: 'Admin User' })),
  ],
});

export const userVotes = () => ({ success: true, votes: { 12: 'upvote', 9: 'upvote' } as Record<number, string> });

export const siteConfig = (config: SiteConfig) => ({ config, version: 7, updatedAt: ago(5 * DAY), updatedByName: 'Admin User' });

export const configSnapshots = () => ({
  snapshots: [
    { id: 4, name: 'Before spring schedule', description: 'Mon/Thu games, 21 spots', config_version: 6, is_auto: false, created_at: ago(9 * DAY), created_by_name: 'Admin User' },
    { id: 5, name: 'auto: before update', description: null, config_version: 7, is_auto: true, created_at: ago(5 * DAY), created_by_name: 'Admin User' },
  ],
});

const tally = (name: string, team: string, first: number, second: number, third: number) => ({
  name, team, firstPlace: first, secondPlace: second, thirdPlace: third,
  votes: first + second + third, score: first * 4 + second * 2 + third,
});

export const tournamentVotes = () => ({
  success: true,
  tallies: {
    best_player: [tally('Hadi', 'Wolves', 9, 4, 2), tally('Omar', 'Leopard', 6, 5, 3), tally('Zubidullah', 'Falcon', 4, 6, 4), tally('Khalil', 'Oryx', 2, 3, 6)],
    best_goalkeeper: [tally('Ulugbek', 'Oryx', 8, 3, 1), tally('Hadi', 'Wolves', 5, 6, 2)],
  },
  userVotes: {
    best_player: { first: { playerName: 'Hadi', playerTeam: 'Wolves' }, second: { playerName: 'Omar', playerTeam: 'Leopard' }, third: null },
    best_goalkeeper: { first: null, second: null, third: null },
  },
  isAuthenticated: true,
  votingOpen: true,
  votingDeadline: ahead(3 * DAY),
  rankPoints: { 1: 4, 2: 2, 3: 1 },
});

export const adminTournamentVotes = () => {
  const votes = [
    ['Hadi', 'Wolves', 1, 'Jane Smith'], ['Omar', 'Leopard', 2, 'Jane Smith'], ['Zubidullah', 'Falcon', 3, 'Jane Smith'],
    ['Hadi', 'Wolves', 1, 'David Wilson'], ['Khalil', 'Oryx', 2, 'David Wilson'], ['Omar', 'Leopard', 3, 'David Wilson'],
  ].map(([player_name, player_team, rank, voter_name], i) => ({
    id: i + 1, award_type: 'best_player', player_name, player_team, rank,
    created_at: ago((i + 1) * HOUR), updated_at: ago((i + 1) * HOUR),
    voter_id: `u-${String(voter_name).split(' ')[0].toLowerCase()}`, voter_name,
    voter_email: `${String(voter_name).split(' ')[0].toLowerCase()}@student.42.fr`,
  }));
  const t = tournamentVotes().tallies;
  const toSummary = (rows: ReturnType<typeof tally>[]) => rows.map((r) => ({
    playerName: r.name, playerTeam: r.team, voteCount: r.votes, score: r.score,
    firstPlace: r.firstPlace, secondPlace: r.secondPlace, thirdPlace: r.thirdPlace,
  }));
  return {
    success: true,
    votes,
    summary: { best_player: toSummary(t.best_player), best_goalkeeper: toSummary(t.best_goalkeeper) },
    totals: { best_player: 44, best_goalkeeper: 25 },
  };
};

export const money = () =>
  SEED_PLAYERS.slice(0, 21).map(([name, intra], i) => ({
    date: ago(2 * DAY), name, intra, amount: 10, paid: i < 12,
  }));

export { DEFAULT_CONFIG };
