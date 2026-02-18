'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/lib/api';
import type { ProductFromApi } from '@/types';

export function useProduct(id: string | null) {
  const [data, setData] = useState<ProductFromApi | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    productsApi
      .get(id)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [id, refetch]);

  return { data, loading, error, refetch };
}
