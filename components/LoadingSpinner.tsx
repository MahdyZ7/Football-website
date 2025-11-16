
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClass = size === 'small' ? 'spinner-small' : size === 'large' ? 'spinner-large' : 'spinner-medium';

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`} />
      {message && (
        <p className="spinner-message">
          {message}
        </p>
      )}
    </div>
  );
}
