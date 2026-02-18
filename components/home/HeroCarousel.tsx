'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const HERO_IMAGES = [
  {
    src: 'https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg',
    alt: 'Resin jewelry',
  },
  {
    src: 'https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934',
    alt: 'Handloom heritage',
  },
];

const AUTO_SCROLL_MS = 4500;

export function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, AUTO_SCROLL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-[420px] w-full overflow-hidden rounded-[12px]">
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
              priority
              className="object-cover"
            />
          </div>
        ))}
        {/* Dark overlay for text readability */}
        <div
          className="absolute inset-0 z-[2] bg-primary/30"
          aria-hidden
        />
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-white drop-shadow-md md:text-4xl">
          Where Resin Elegance Meets Handloom Heritage
        </h1>
        <Button asChild size="lg" variant="accent" className="shadow-lg">
          <Link href="/products">Shop Now</Link>
        </Button>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Slide ${i + 1}`}
            className="h-2 w-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i === activeIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
              transform: i === activeIndex ? 'scale(1.25)' : 'scale(1)',
            }}
            onClick={() => setActiveIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
