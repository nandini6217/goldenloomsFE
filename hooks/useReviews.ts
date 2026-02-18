'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '@/lib/api';
import type { ReviewFromApi } from '@/types';

export function useReviews(productId: string | null) {
  const [reviews, setReviews] = useState<ReviewFromApi[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(!!productId);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    reviewsApi
      .getByProduct(productId)
      .then((data) => {
        setReviews(data.reviews);
        setAvgRating(data.avgRating);
        setReviewCount(data.reviewCount);
      })
      .catch((e) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setAvgRating(0);
      setReviewCount(0);
      setLoading(false);
      setError(null);
      return;
    }
    refetch();
  }, [productId, refetch]);

  return { reviews, avgRating, reviewCount, loading, error, refetch };
}
