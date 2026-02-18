'use client';

type StarRatingProps = { value: number; count: number };

export function StarRating({ value, count }: StarRatingProps) {
  if (count === 0) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="text-amber-600 text-sm">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span className="text-primary/60 ml-1">({count})</span>
    </span>
  );
}
