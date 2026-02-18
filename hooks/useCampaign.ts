'use client';

import { useState, useEffect, useCallback } from 'react';
import { campaignsApi } from '@/lib/api';
import type { CampaignWithProducts } from '@/types';

export function useCampaign(slug: string | null) {
  const [data, setData] = useState<CampaignWithProducts | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    campaignsApi
      .getBySlug(slug)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [slug, refetch]);

  return { data, loading, error, refetch };
}
