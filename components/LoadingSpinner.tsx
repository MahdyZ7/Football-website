
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <div
        className={`${sizeClasses[size]} border-3 border-[var(--border-color)] border-t-ft-primary rounded-full animate-spin`}
        role="status"
        aria-label={message || 'Loading'}
      />
      {message && (
        <p className="mt-2.5" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
