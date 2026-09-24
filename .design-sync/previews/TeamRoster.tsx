import { TeamRoster } from 'football-ds';
import { teams, noop } from './_fixtures';

export const FullTeam = () => (
  <div className="w-[400px]">
    <TeamRoster team={teams.team1} teamNumber={1} maxPlayers={7} color="blue" avgRating="3.7" onRemovePlayer={noop} onUpdateName={noop} />
  </div>
);

export const Colours = () => (
  <div className="grid grid-cols-2 gap-6 w-[860px]">
    <TeamRoster team={{ name: 'Team Green', players: teams.team2.players.slice(0, 3) }} teamNumber={2} maxPlayers={7} color="green" avgRating="3.6" onRemovePlayer={noop} onUpdateName={noop} />
    <TeamRoster team={{ name: 'Team Orange', players: teams.team3.players.slice(0, 3) }} teamNumber={3} maxPlayers={7} color="orange" avgRating="3.5" onRemovePlayer={noop} onUpdateName={noop} />
  </div>
);

export const Empty = () => (
  <div className="w-[400px]">
    <TeamRoster team={{ name: 'Team Blue', players: [] }} teamNumber={1} maxPlayers={7} color="blue" avgRating="0.0" onRemovePlayer={noop} onUpdateName={noop} />
  </div>
);
