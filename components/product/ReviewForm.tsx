'use client';

import { useState } from 'react';
import Link from 'next/link';
import { reviewsApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ReviewFormProps = {
  productId: string;
  isLoggedIn: boolean;
  onSubmitted: () => void;
};

export function ReviewForm({ productId, isLoggedIn, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || submitting || !isLoggedIn) return;
    setSubmitting(true);
    try {
      await reviewsApi.create(productId, { rating, comment: comment || undefined });
      onSubmitted();
      setRating(5);
      setComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-primary/70 text-sm">
        <Link href={`/login?returnTo=${encodeURIComponent(`/products/${productId}`)}`} className="underline text-accent">Log in</Link> to write a review.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border border-primary/10 rounded-[12px] space-y-4 max-w-md">
      <h3 className="font-semibold text-primary">Write a review</h3>
      <div>
        <label className="text-sm text-primary/70 block mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="rounded-[12px] border border-primary/20 px-3 py-2 text-sm w-full max-w-[80px]"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm text-primary/70 block mb-1">Comment (optional)</label>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Your review..."
          className="max-w-md"
        />
      </div>
      <Button type="submit" variant="accent" size="sm" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit review'}
      </Button>
    </form>
  );
}
