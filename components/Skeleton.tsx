import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded'
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  const skeletonElement = (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );

  if (count > 1) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="mb-2">
            {skeletonElement}
          </div>
        ))}
      </>
    );
  }

  return skeletonElement;
}

// Skeleton for user cards/rows in lists
export function UserListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={20} />
            <Skeleton width="60%" height={16} />
          </div>
          <div className="flex gap-2">
            <Skeleton width={80} height={36} />
            <Skeleton width={80} height={36} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for table rows
export function TableRowSkeleton({
  columns = 4,
  rows = 5
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr
          key={rowIndex}
          className="border-b"
          style={{ borderColor: 'var(--border-color)' }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="px-4 py-3">
              <Skeleton height={20} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Skeleton for feedback/card items
export function FeedbackCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Skeleton width={80} height={24} className="rounded-full" />
            <Skeleton width={100} height={24} className="rounded-full" />
          </div>
          <Skeleton width="70%" height={24} className="mb-3" />
          <Skeleton width="100%" height={16} count={2} />
          <div className="flex items-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <Skeleton width={80} height={36} />
            <Skeleton width={80} height={36} />
            <Skeleton width="30%" height={16} className="ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for team cards
export function TeamCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <Skeleton width="50%" height={28} className="mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, playerIndex) => (
              <div key={playerIndex} className="flex items-center gap-3">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton width="70%" height={20} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for stats/dashboard cards
export function StatsCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <Skeleton width="60%" height={20} className="mb-3" />
          <Skeleton width="40%" height={36} className="mb-2" />
          <Skeleton width="80%" height={16} />
        </div>
      ))}
    </div>
  );
}

// Skeleton for form inputs
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index}>
          <Skeleton width="30%" height={20} className="mb-2" />
          <Skeleton width="100%" height={48} />
        </div>
      ))}
      <Skeleton width={120} height={44} className="mt-6" />
    </div>
  );
}

// Page-level skeleton with header
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height={40} />
        <Skeleton width={120} height={40} />
      </div>
      <div className="space-y-4">
        <Skeleton width="100%" height={200} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton width="100%" height={150} />
          <Skeleton width="100%" height={150} />
        </div>
      </div>
    </div>
  );
}

// Skeleton for home page player list
export function PlayerListSkeleton({ count = 21 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`p-4 rounded-lg border-l-4`}
          style={{
            backgroundColor: index < 21 ? 'var(--paid-bg)' : 'var(--unpaid-bg)',
            borderLeftColor: index < 21 ? '#16a34a' : 'var(--ft-accent)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Skeleton variant="circular" width={32} height={32} />
              <div className="flex flex-col flex-1 gap-2">
                <Skeleton width="60%" height={20} />
                <Skeleton width="40%" height={16} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="circular" width={32} height={32} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
