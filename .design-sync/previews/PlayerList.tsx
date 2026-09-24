import { PlayerList } from 'football-ds';
import { players, noop } from './_fixtures';

export const WithWaitlist = () => (
  <div className="w-[860px]">
    <PlayerList users={players} loading={false} error={null} onRemove={noop} onEditName={noop} />
  </div>
);

export const Loading = () => (
  <div className="w-[860px]">
    <PlayerList users={[]} loading error={null} onRemove={noop} onEditName={noop} />
  </div>
);

export const Empty = () => (
  <div className="w-[860px]">
    <PlayerList users={[]} loading={false} error={null} onRemove={noop} onEditName={noop} />
  </div>
);
