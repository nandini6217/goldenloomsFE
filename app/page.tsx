import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { FeaturedReviews } from '@/components/home/FeaturedReviews';
import { HeroCarousel } from '@/components/home/HeroCarousel';

import { BRAND_NAME } from '@/config/constants';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className="container-custom">
      {/* Hero: auto-scrolling images with tagline + Shop Now overlay */}
      <HeroCarousel />

      <div className="divider-gold my-12" />

      {/* Category cards */}
      <section className="py-12">
        <h2 className="font-display text-2xl font-semibold text-primary text-center mb-10">
          Explore Collections
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link href="/products?category=RESIN" className="group block">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-soft-hover group-hover:scale-[1.02]">
              <div className="relative aspect-[4/3] bg-primary/10">
                <Image
                  src="https://images.pexels.com/photos/7256261/pexels-photo-7256261.jpeg"
                  alt="Resin Collection – handcrafted resin jewelry"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <p className="font-display font-semibold text-primary">Resin Collection</p>
                <p className="text-sm text-primary/70">Elegant handcrafted resin jewelry</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/products?category=HANDLOOM" className="group block">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-soft-hover group-hover:scale-[1.02]">
              <div className="relative aspect-[4/3] bg-primary/10">
                <Image
                  src="https://cdn.shopify.com/s/files/1/0443/7553/9878/files/Screen_Shot_2020-09-30_at_5.48.40_pm_1024x1024.jpg?v=1601471934"
                  alt="Woolen Handloom Collection – traditional handloom heritage"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <p className="font-display font-semibold text-primary">Woolen Handloom Collection</p>
                <p className="text-sm text-primary/70">Traditional handloom heritage</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      <div className="divider-gold my-12" />

      {/* Featured products */}
      <section className="py-12">
        <h2 className="font-display text-2xl font-semibold text-primary text-center mb-10">
          Featured Products
        </h2>
        <FeaturedProducts />
      </section>

      <div className="divider-gold my-12" />

      {/* About */}
      <section className="py-12">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold text-primary mb-4">Our Story</h2>
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

      <div className="divider-gold my-12" />

      {/* Featured reviews — 5-star reviews with comments from real customers */}
      <section className="py-12">
        <h2 className="font-display text-2xl font-semibold text-primary text-center mb-2">
          Featured Reviews
        </h2>
        <p className="text-center text-primary/70 text-sm mb-10">
          Real feedback from verified customers
        </p>
        <FeaturedReviews />
      </section>

      <div className="divider-gold my-12" />

      {/* Social grid */}
      <section className="py-12">
        <h2 className="font-display text-2xl font-semibold text-primary text-center mb-10">
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
  );
}
