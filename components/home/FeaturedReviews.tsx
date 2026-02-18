'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reviewsApi, type FeaturedReviewFromApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';

export function FeaturedReviews() {
  const [reviews, setReviews] = useState<FeaturedReviewFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewsApi
      .getFeatured({ limit: 6 })
      .then((data) => setReviews(data.reviews))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex gap-1 text-accent mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s}>★</span>
              ))}
            </div>
            <p className="text-primary/80 text-sm italic animate-pulse">Loading...</p>
            <p className="mt-2 text-sm text-primary/60">—</p>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-center text-primary/60 text-sm py-8">
        No featured reviews yet. Check back after our customers share their experience!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {reviews.map((r) => (
        <Card key={r._id} className="p-6 flex flex-col">
          <div className="flex gap-1 text-accent mb-3">
            {Array.from({ length: r.rating }, (_, i) => (
              <span key={i}>★</span>
            ))}
          </div>
          <p className="text-primary/80 text-sm italic flex-1">&ldquo;{r.comment}&rdquo;</p>
          <p className="mt-2 text-sm font-medium text-primary">
            — {r.user?.name ?? 'Customer'}
            {r.product?.name ? (
              <>
                , on{' '}
                <Link href={`/products/${r.product._id}`} className="text-accent hover:underline">
                  {r.product.name}
                </Link>
              </>
            ) : null}
          </p>
        </Card>
      ))}
    </div>
  );
}
