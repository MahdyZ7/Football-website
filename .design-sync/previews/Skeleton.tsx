import { Skeleton } from 'football-ds';

export const Variants = () => (
  <div className="flex items-center gap-4 w-96">
    <Skeleton variant="circular" width={48} height={48} />
    <div className="flex-1 flex flex-col gap-2">
      <Skeleton variant="text" width="70%" height={18} />
      <Skeleton variant="text" width="40%" height={14} />
    </div>
  </div>
);

export const Rectangular = () => (
  <div className="w-96">
    <Skeleton variant="rectangular" height={120} />
  </div>
);

export const TextLines = () => (
  <div className="w-96">
    <Skeleton variant="text" count={3} height={14} />
  </div>
);
