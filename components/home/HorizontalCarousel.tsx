'use client';

import { useRef } from 'react';

type HorizontalCarouselProps = {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  /** Min width per slide (card); used for scroll amount. Default 280 */
  itemMinWidth?: number;
  /** Gap between items (Tailwind gap class). Default gap-4 */
  gap?: string;
};

export function HorizontalCarousel({
  children,
  className = '',
  'aria-label': ariaLabel,
  itemMinWidth = 280,
  gap = 'gap-4',
}: HorizontalCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 || itemMinWidth * 2;
    el.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Arrows: visible from md up */}
      <button
        type="button"
        onClick={() => scroll('left')}
        aria-label="Scroll carousel left"
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-soft text-primary hover:bg-white hidden md:flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => scroll('right')}
        aria-label="Scroll carousel right"
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-soft text-primary hover:bg-white hidden md:flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className={`flex overflow-x-auto snap-x snap-mandatory scroll-smooth ${gap} py-2 -mx-2 px-2 md:px-0 md:mx-0 scrollbar-hide`}
        style={{ WebkitOverflowScrolling: 'touch' }}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}

/** Wrapper for each carousel item: enforces min-width and snap alignment */
export function HorizontalCarouselItem({
  children,
  className = '',
  minWidth = 280,
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: number;
}) {
  return (
    <div
      className={`shrink-0 snap-start ${className}`}
      style={{ minWidth: `${minWidth}px` }}
    >
      {children}
    </div>
  );
}
