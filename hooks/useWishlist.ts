'use client';

import { useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '@/lib/api';
import type { ProductFromApi } from '@/types';

export function useWishlist(enabled: boolean) {
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    wishlistApi
      .get()
      .then((res) => {
        setProductIds(new Set(res.productIds));
        setProducts(res.products ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setProductIds(new Set());
      setProducts([]);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [enabled, refetch]);

  return { productIds, products, loading, error, refetch };
}
