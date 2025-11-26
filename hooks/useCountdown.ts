import { useState, useEffect } from 'react';
import { getNextRegistration } from '../lib/utils/allowed_times';

/**
 * Custom hook for countdown timer to next registration
 * Single Responsibility: Manage countdown state and updates
 */
export function useCountdown() {
  const [timeUntilNext, setTimeUntilNext] = useState("");

  useEffect(() => {
    const next = getNextRegistration();

    const updateCountdown = () => {
      const now = new Date();
      const diff = next.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeUntilNext(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeUntilNext("Registration should be open now");
      }
    };

    // Update countdown every second for accurate display
    const countdownTimer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  return timeUntilNext;
}
