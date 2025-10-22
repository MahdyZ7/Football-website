'use client';

import { useEffect, useState } from 'react';

const SpecialEventToast: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 12 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="special-event-toast"
      onClick={() => setIsVisible(false)}
      role="alert"
      aria-live="polite"
    >
      <div className="special-event-content">
        <div className="special-event-icon">⚽</div>
        <div className="special-event-message">
          <strong>Special Event This Week!</strong>
          <p>Player limit changed to 10 players (8 main + 2 substitutes) for this week only.</p>
        </div>
        <button
          className="special-event-close"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default SpecialEventToast;
