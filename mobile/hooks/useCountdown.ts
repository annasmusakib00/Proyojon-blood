import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
}

/**
 * Hook to count down to a target date.
 * Updates every minute. Returns remaining days, hours, minutes and expiry status.
 */
export function useCountdown(targetDate: string | Date | null): CountdownResult {
  const calculateRemaining = useCallback((): CountdownResult => {
    if (!targetDate) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true };
    }

    const target = new Date(targetDate).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isExpired: false };
  }, [targetDate]);

  const [remaining, setRemaining] = useState<CountdownResult>(calculateRemaining);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setRemaining(calculateRemaining());

    // Update every minute
    intervalRef.current = setInterval(() => {
      const result = calculateRemaining();
      setRemaining(result);

      if (result.isExpired && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [calculateRemaining]);

  return remaining;
}
