
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export default function LoadingSpinner({ size = 'medium', message = 'Loading...' }: LoadingSpinnerProps) {

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div 
        style={{
          width: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          height: size === 'small' ? '16px' : size === 'large' ? '48px' : '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #306030',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {message && (
        <p style={{ marginTop: '10px', color: '#666' }}>
          {message}
        </p>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
