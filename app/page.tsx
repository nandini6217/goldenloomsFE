import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { NewArrivals } from '@/components/home/NewArrivals';
import { HorizontalCarousel, HorizontalCarouselItem } from '@/components/home/HorizontalCarousel';
import { HomeCategoryNav, HomeDashboardProducts } from '@/components/home/HomeCategoryNav';

import { BRAND_NAME } from '@/config/constants';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="container-custom py-8 animate-pulse h-32 bg-secondary/30 rounded-xl" />}>
        {/* Nav + Hero: Hero is full-bleed, Nav stays in container */}
        <div className="container-custom">
          <HomeCategoryNav />
        </div>
      </Suspense>
      {/* Hero: full-bleed on mobile; on desktop constrained to align with sections below */}
      <div className="w-full md:max-w-[1440px] md:mx-auto md:px-4">
        <HeroCarousel />
      </div>

      <Suspense fallback={<div className="container-custom py-12 animate-pulse h-64 bg-secondary/30 rounded-xl" />}>
      <div className="container-custom md:px-4">
        {/* Dashboard products filtered by category chips (Picks for you + Wishlist now CTA) */}
        <HomeDashboardProducts />

      <div className="divider-gold my-6 md:my-8 lg:my-10" />

      {/* Category cards - carousel on mobile, centered grid on webview */}
      <section className="py-6 md:py-12 lg:py-16">
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-primary text-center mb-6 md:mb-10">
          Explore Collections
        </h2>
        <div className="md:hidden">
          <HorizontalCarousel aria-label="Explore collections" itemMinWidth={280} gap="gap-4">
            <HorizontalCarouselItem minWidth={280}>
              <Link href="/products?category=RESIN" className="group block">
                <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                  <div className="relative aspect-square bg-primary/10 overflow-hidden">
                    <Image
                      src="https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg"
                      alt="Resin Collection – handcrafted resin jewelry"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-display font-semibold text-primary">Resin Collection</p>
                    <p className="text-sm text-primary/70">Elegant handcrafted resin jewelry</p>
                  </CardContent>
                </Card>
              </Link>
            </HorizontalCarouselItem>
            <HorizontalCarouselItem minWidth={280}>
              <Link href="/products?category=HANDLOOM" className="group block">
                <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                  <div className="relative aspect-square bg-primary/10 overflow-hidden">
                    <Image
                      src="https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934"
                      alt="Woolen Handloom Collection – traditional handloom heritage"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-display font-semibold text-primary">Woolen Handloom Collection</p>
                    <p className="text-sm text-primary/70">Traditional handloom heritage</p>
                  </CardContent>
                </Card>
              </Link>
            </HorizontalCarouselItem>
            <HorizontalCarouselItem minWidth={280}>
              <Link href="/products?category=OTHERS" className="group block">
                <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                  <div className="relative aspect-square bg-primary/10 overflow-hidden">
                    <Image
                      src="https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg"
                      alt="Others Collection – handcrafted variety"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="font-display font-semibold text-primary">Others Collection</p>
                    <p className="text-sm text-primary/70">More handcrafted picks</p>
                  </CardContent>
                </Card>
              </Link>
            </HorizontalCarouselItem>
          </HorizontalCarousel>
        </div>
        <div className="hidden md:flex md:justify-center">
          <div className="grid grid-cols-3 gap-4 lg:gap-6 lg:max-w-4xl lg:mx-auto">
            <Link href="/products?category=RESIN" className="group block">
              <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                <div className="relative aspect-square bg-primary/10 overflow-hidden">
                  <Image
                    src="https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg"
                    alt="Resin Collection – handcrafted resin jewelry"
                    fill
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="font-display font-semibold text-primary">Resin Collection</p>
                  <p className="text-sm text-primary/70">Elegant handcrafted resin jewelry</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products?category=HANDLOOM" className="group block">
              <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                <div className="relative aspect-square bg-primary/10 overflow-hidden">
                  <Image
                    src="https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934"
                    alt="Woolen Handloom Collection – traditional handloom heritage"
                    fill
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="font-display font-semibold text-primary">Woolen Handloom Collection</p>
                  <p className="text-sm text-primary/70">Traditional handloom heritage</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products?category=OTHERS" className="group block">
              <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover">
                <div className="relative aspect-square bg-primary/10 overflow-hidden">
                  <Image
                    src="https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg"
                    alt="Others Collection – handcrafted variety"
                    fill
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="font-display font-semibold text-primary">Others Collection</p>
                  <p className="text-sm text-primary/70">More handcrafted picks</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      <div className="divider-gold my-6 md:my-8 lg:my-10" />

      {/* Featured products */}
      <section id="featured" className="py-6 md:py-8 lg:py-10">
        <FeaturedProducts />
      </section>

      <div className="divider-gold my-6 md:my-8 lg:my-10" />

      {/* New Arrivals */}
      <section className="py-6 md:py-8 lg:py-10">
        <NewArrivals />
      </section>

      <div className="divider-gold my-6 md:my-8 lg:my-10" />

      {/* About */}
      <section className="py-6 md:py-6 lg:py-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-6">
          <div className="flex-1">
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-4">Our Story</h2>
            <p className="text-primary/80 leading-relaxed">
              {BRAND_NAME} brings together the artistry of resin jewelry and the timeless craft of
              handloom. Each piece is crafted with care by skilled artisans, blending modern
              elegance with traditional heritage.
            </p>
          </div>
          <div className="h-48 w-48 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary/50 text-sm">
            Artisan placeholder
          </div>
        </div>
      </section>

      <div className="divider-gold my-6 md:my-8 lg:my-10" />

      {/* Social grid */}
      <section className="py-6 md:py-6 lg:py-8">
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-primary text-center mb-6 md:mb-6">
          Follow Us
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-[12px] bg-primary/10 flex items-center justify-center text-primary/40 text-xs"
            >
              @{BRAND_NAME.replace(/\s/g, '').toLowerCase()}
            </div>
          ))}
        </div>
      </section>
      </div>
      </Suspense>
    </>
  );
}
