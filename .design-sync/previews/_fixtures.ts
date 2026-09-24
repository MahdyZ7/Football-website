// Shared demo data for previews (not a component). Names from scripts/seed-dev-data.ts.
const now = Date.now();
const iso = (hoursAgo: number) => new Date(now - hoursAgo * 3600_000).toISOString();

const NAMES: Array<[string, string]> = [
  ['John Doe', 'jdoe'], ['Jane Smith', 'jsmith'], ['Michael Johnson', 'mjohnson'], ['Emily Davis', 'edavis'],
  ['David Wilson', 'dwilson'], ['Sarah Miller', 'smiller'], ['James Brown', 'jbrown'], ['Lisa Anderson', 'landerson'],
  ['Robert Taylor', 'rtaylor'], ['Maria Garcia', 'mgarcia'], ['Thomas Martinez', 'tmartinez'], ['Jennifer Lee', 'jlee'],
  ['Christopher White', 'cwhite'], ['Amanda Harris', 'aharris'], ['Daniel Clark', 'dclark'], ['Jessica Lewis', 'jlewis'],
  ['Matthew Robinson', 'mrobinson'], ['Ashley Walker', 'awalker'], ['Omar Haddad', 'ohaddad'], ['Khalil Nasser', 'knasser'],
  ['Hadi Mansour', 'hmansour'], ['Anas Karim', 'akarim'], ['Zoir Tashkentov', 'ztashken'],
];

export const players = NAMES.map(([name, intra], i) => ({
  name,
  intra,
  verified: i !== 17,
  created_at: iso(30 - i),
  registration_status: (i >= 21 ? 'waitlisted' : 'confirmed') as 'confirmed' | 'waitlisted',
  waitlist_position: i >= 21 ? i - 20 : null,
  owned_by_current_user: intra === 'jdoe',
}));

export const rated = players.slice(0, 21).map((p, i) => ({ ...p, rating: [5, 4, 3, 4, 2, 5, 3][i % 7] }));

export const teams = {
  team1: { name: 'Team Blue', players: rated.slice(0, 7) },
  team2: { name: 'Team Green', players: rated.slice(7, 14) },
  team3: { name: 'Team Orange', players: rated.slice(14, 21) },
};

export const noop = () => {};
