
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
        className={`${sizeClasses[size]} border-3 border-gray-200 border-t-status-registered rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-2.5 text-gray-600 dark:text-gray-400">
          {message}
        </p>
      )}
    </div>
  );
}
