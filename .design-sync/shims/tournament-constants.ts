// Alias target for '../../lib/constants/tournament' in the design bundle: same exports,
// but TOURNAMENT_TEAMS logos point at bundled copies (a design has no /public folder).
// The '.ts' suffix below deliberately bypasses the tsconfig alias to reach the real module.
import * as real from '../../lib/constants/tournament.ts';
import { falcon, leopard, oryx, wolves } from './team-logos';

export * from '../../lib/constants/tournament.ts';
export const TOURNAMENT_TEAMS = {
  Falcon: { ...real.TOURNAMENT_TEAMS.Falcon, logo: falcon },
  Leopard: { ...real.TOURNAMENT_TEAMS.Leopard, logo: leopard },
  Oryx: { ...real.TOURNAMENT_TEAMS.Oryx, logo: oryx },
  Wolves: { ...real.TOURNAMENT_TEAMS.Wolves, logo: wolves },
} as const;
