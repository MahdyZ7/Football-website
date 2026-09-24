import { TeamPlayerCard } from 'football-ds';
import { rated, noop } from './_fixtures';

const open = { team1: false, team2: false, team3: false };

export const ThreeTeams = () => (
  <div className="w-[420px]">
    <TeamPlayerCard player={rated[1]} index={2} teamMode={3} teamsFull={open} onDiscard={noop} onAddToTeam={noop} onRatingChange={noop} />
  </div>
);

export const TwoTeams = () => (
  <div className="w-[420px]">
    <TeamPlayerCard player={rated[4]} index={5} teamMode={2} teamsFull={open} onDiscard={noop} onAddToTeam={noop} onRatingChange={noop} />
  </div>
);

export const TeamFull = () => (
  <div className="w-[420px]">
    <TeamPlayerCard player={rated[17]} index={18} teamMode={3} teamsFull={{ team1: true, team2: false, team3: true }} onDiscard={noop} onAddToTeam={noop} onRatingChange={noop} />
  </div>
);
