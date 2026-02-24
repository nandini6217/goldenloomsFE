'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const HERO_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg',
    alt: 'Resin jewelry',
    title: 'Where Resin Elegance Meets ',
    accentPhrase: 'Handloom Heritage',
  },
  {
    src: 'https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934',
    alt: 'Handloom heritage',
    title: 'Premium ',
    accentPhrase: 'Handcrafted',
    subtitle: 'Resin Jewelry & Woolen Handloom',
  },
];

const AUTO_SCROLL_MS = 4500;
const SWIPE_THRESHOLD = 50;

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback(
    (index: number) => {
      setActiveIndex(index);
      setProgress(0);
    },
    []
  );

  const goNext = useCallback(() => {
    goToSlide((activeIndex + 1) % HERO_IMAGES.length);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + HERO_IMAGES.length) % HERO_IMAGES.length);
  }, [activeIndex, goToSlide]);

  // Reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Auto-scroll (paused when reduced motion)
  useEffect(() => {
    if (prefersReducedMotion) return;
    autoScrollRef.current = setInterval(goNext, AUTO_SCROLL_MS);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [prefersReducedMotion, goNext]);

  // Progress bar
  useEffect(() => {
    if (prefersReducedMotion) return;
    const step = 50;
    const increment = (100 / (AUTO_SCROLL_MS / step));
    progressIntervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return Math.min(p + increment, 100);
      });
    }, step);
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [prefersReducedMotion, activeIndex]);

  // Reset progress when slide changes
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const slide = HERO_IMAGES[activeIndex];

  return (
    <section
      className="relative w-full overflow-hidden min-h-[50vh] sm:min-h-[55vh] md:min-h-[420px] lg:min-h-[480px]"
      aria-label="Hero carousel"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip link for keyboard users */}
      <a
        href="#featured"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-20 focus:px-4 focus:py-2 focus:bg-white focus:text-primary focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip hero
      </a>

      {/* Image carousel */}
      <div className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img.src}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: i === activeIndex ? 1 : 0,
              zIndex: i === activeIndex ? 1 : 0,
            }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="object-cover"
            />
          </div>
        ))}
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/30 to-transparent"
          aria-hidden
        />
      </div>

      {/* Overlay content - aria-live for screen readers */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center animate-hero-in"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="font-display font-bold text-white drop-shadow-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            {slide.title}{' '}
            <span className="text-accent">{slide.accentPhrase}</span>
            {slide.subtitle ? (
              <>
                <br />
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-white/95">
                  {slide.subtitle}
                </span>
              </>
            ) : null}
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Premium handcrafted resin jewelry & woolen handloom
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button asChild size="lg" variant="accent" className="shadow-lg min-w-[140px]">
            <Link href="/products">Shop Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white min-w-[160px]">
            <Link href="/products">Explore collections</Link>
          </Button>
        </div>
      </div>

      {/* Progress bar + Dots */}
      <div className="absolute bottom-6 left-0 right-0 z-10 px-4">
        {/* Progress bar */}
        {!prefersReducedMotion && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-24 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/95 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {/* Dots */}
        <div className="flex justify-center gap-2 mt-2">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex}
              className="h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                backgroundColor: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                transform: i === activeIndex ? 'scale(1.25)' : 'scale(1)',
              }}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
