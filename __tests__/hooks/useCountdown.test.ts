/**
 * Tests for useCountdown hook
 * Validates countdown timer functionality and formatting
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCountdown } from '@/hooks/useCountdown';
import * as allowedTimes from '@/lib/utils/allowed_times';

// Mock the getNextRegistration function
jest.mock('@/lib/utils/allowed_times', () => ({
  getNextRegistration: jest.fn(),
}));

describe('useCountdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Countdown formatting', () => {
    it('should format countdown with days when > 24 hours', async () => {
      // Set next registration to 2 days, 3 hours, 15 minutes, 30 seconds from now
      const futureDate = new Date();
      futureDate.setTime(
        futureDate.getTime() +
        2 * 24 * 60 * 60 * 1000 + // 2 days
        3 * 60 * 60 * 1000 +       // 3 hours
        15 * 60 * 1000 +           // 15 minutes
        30 * 1000                  // 30 seconds
      );

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      // Wait for initial update
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toMatch(/2d 3h 15m 30s/);
    });

    it('should format countdown without days when < 24 hours', async () => {
      // Set next registration to 5 hours, 30 minutes, 45 seconds from now
      const futureDate = new Date();
      futureDate.setTime(
        futureDate.getTime() +
        5 * 60 * 60 * 1000 +  // 5 hours
        30 * 60 * 1000 +      // 30 minutes
        45 * 1000             // 45 seconds
      );

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      // Wait for initial update
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toMatch(/5h 30m 45s/);
      expect(result.current).not.toContain('d');
    });

    it('should show "Registration should be open now" when time has passed', async () => {
      // Set next registration to past
      const pastDate = new Date();
      pastDate.setTime(pastDate.getTime() - 1000); // 1 second ago

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(pastDate);

      const { result } = renderHook(() => useCountdown());

      // Wait for initial update
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('Registration should be open now');
    });
  });

  describe('Timer updates', () => {
    it('should update countdown every second', async () => {
      // Set next registration to 10 seconds from now
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 10 * 1000);

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      // Initial update
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      const initialValue = result.current;
      expect(initialValue).toMatch(/0h 0m (9|10)s/);

      // Advance 1 second
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      const afterOneSecond = result.current;
      expect(afterOneSecond).toMatch(/0h 0m (8|9)s/);

      // Verify the value changed
      expect(afterOneSecond).not.toBe(initialValue);
    });

    it('should handle countdown reaching zero', async () => {
      // Set next registration to 2 seconds from now
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 2000);

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      // Initial update
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toMatch(/0h 0m (1|2)s/);

      // Advance past the deadline
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current).toBe('Registration should be open now');
    });
  });

  describe('Cleanup', () => {
    it('should clear interval on unmount', () => {
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 60000);

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = renderHook(() => useCountdown());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle exactly 0 time remaining', async () => {
      const now = new Date();
      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(now);

      const { result } = renderHook(() => useCountdown());

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toBe('Registration should be open now');
    });

    it('should handle large time differences', async () => {
      // Set next registration to 10 days from now
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 10 * 24 * 60 * 60 * 1000);

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toMatch(/10d/);
      expect(result.current).toContain('h');
      expect(result.current).toContain('m');
      expect(result.current).toContain('s');
    });

    it('should handle time transitions (seconds to minutes, minutes to hours, etc.)', async () => {
      // Start at 1 minute 1 second
      const futureDate = new Date();
      futureDate.setTime(futureDate.getTime() + 61 * 1000);

      jest.spyOn(allowedTimes, 'getNextRegistration').mockReturnValue(futureDate);

      const { result } = renderHook(() => useCountdown());

      // Initial state
      await act(async () => {
        jest.advanceTimersByTime(0);
      });

      expect(result.current).toMatch(/0h 1m (0|1)s/);

      // Advance to cross the minute boundary
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current).toMatch(/0h 0m 59s/);
    });
  });
});
