import { LoadingSpinner } from 'football-ds';

export const Sizes = () => (
  <div className="flex items-end gap-10">
    <LoadingSpinner size="small" message="Saving..." />
    <LoadingSpinner size="medium" message="Loading players..." />
    <LoadingSpinner size="large" message="Balancing teams..." />
  </div>
);
