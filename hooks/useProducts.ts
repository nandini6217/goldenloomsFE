'use client';

import { useState, useEffect, useCallback } from 'react';
import { productsApi } from '@/lib/api';
import type { ProductFromApi } from '@/types';

type Params = {
  search?: string;
  category?: string;
  sort?: string;
  featured?: boolean;
  ids?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function useProducts(params?: Params) {
  const [data, setData] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    productsApi
      .list(params)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [params?.search, params?.category, params?.sort, params?.featured, params?.ids, params?.minPrice, params?.maxPrice]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
