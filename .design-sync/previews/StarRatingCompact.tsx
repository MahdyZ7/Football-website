import { StarRatingCompact } from 'football-ds';

export const Values = () => (
  <div className="flex flex-col gap-2" style={{ color: 'var(--text-primary)' }}>
    <div className="flex items-center gap-3"><span className="w-28">Team Blue</span><StarRatingCompact rating={4.2} /></div>
    <div className="flex items-center gap-3"><span className="w-28">Team Green</span><StarRatingCompact rating={3.6} /></div>
    <div className="flex items-center gap-3"><span className="w-28">Team Orange</span><StarRatingCompact rating={2} /></div>
  </div>
);
