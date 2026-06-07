'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Failure } from '@/types';
import { getFailures } from '@/lib/api';

export function useFailures(refreshInterval = 30000) {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFailures = useCallback(async () => {
    try {
      setError(null);
      const data = await getFailures();
      setFailures(data);
      setLastRefreshed(new Date());
      setCountdown(refreshInterval / 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch failures');
    } finally {
      setIsLoading(false);
    }
  }, [refreshInterval]);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchFailures();
  }, [fetchFailures]);

  useEffect(() => {
    fetchFailures();

    intervalRef.current = setInterval(fetchFailures, refreshInterval);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? refreshInterval / 1000 : prev - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchFailures, refreshInterval]);

  return { failures, isLoading, error, refresh, lastRefreshed, countdown };
}
