import { PlayerCard } from 'football-ds';

const now = Date.now();
const confirmed = { name: 'Jane Smith', intra: 'jsmith', verified: true, created_at: new Date(now - 26 * 3600_000).toISOString(), registration_status: 'confirmed' as const };
const unverified = { name: 'Player Nineteen', intra: 'user19', verified: false, created_at: new Date(now - 30 * 3600_000).toISOString(), registration_status: 'confirmed' as const };
const waitlisted = { name: 'Anas Karim', intra: 'akarim', verified: true, created_at: new Date(now - 2 * 3600_000).toISOString(), registration_status: 'waitlisted' as const, waitlist_position: 1 };
const justRegistered = { name: 'John Doe', intra: 'jdoe', verified: false, created_at: new Date(now - 4 * 60_000).toISOString(), registration_status: 'confirmed' as const };
const noop = () => {};

export const Confirmed = () => (
  <div className="max-w-md">
    <PlayerCard user={confirmed} index={1} isOwnRegistration={false} isAdmin={false} onRemove={noop} onEditName={noop} />
  </div>
);

export const Waitlisted = () => (
  <div className="max-w-md">
    <PlayerCard user={waitlisted} index={21} isOwnRegistration={false} isAdmin={false} onRemove={noop} onEditName={noop} />
  </div>
);

export const InvalidIntra = () => (
  <div className="max-w-md">
    <PlayerCard user={unverified} index={18} isOwnRegistration={false} isAdmin={false} onRemove={noop} onEditName={noop} />
  </div>
);

export const OwnRegistration = () => (
  <div className="max-w-md">
    <PlayerCard user={justRegistered} index={20} isOwnRegistration isAdmin={false} onRemove={noop} onEditName={noop} />
  </div>
);

export const AdminView = () => (
  <div className="max-w-md">
    <PlayerCard user={confirmed} index={1} isOwnRegistration={false} isAdmin onRemove={noop} onEditName={noop} />
  </div>
);
