'use client';

import { useState, useEffect, useCallback } from 'react';
import { addressesApi } from '@/lib/api';
import type { AddressFromApi } from '@/types';

export function useAddresses(enabled: boolean) {
  const [data, setData] = useState<AddressFromApi[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    addressesApi
      .list()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}
