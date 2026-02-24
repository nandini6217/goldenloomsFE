'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { ProductPrice } from '@/components/product/ProductPrice';
import { HorizontalCarousel, HorizontalCarouselItem } from '@/components/home/HorizontalCarousel';

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  isFeatured?: boolean;
  images?: string[];
};

const CAROUSEL_ITEM_MIN_WIDTH = 280;
const NEW_ARRIVALS_LIMIT = 10;

function NewArrivalsSectionHeader() {
  return (
    <div className="text-center mb-6 md:mb-10">
      <h2 className="font-display font-semibold text-primary text-xl sm:text-2xl md:text-3xl">
        New Arrivals
      </h2>
      <p className="text-sm text-primary/70 mt-2">Just added</p>
      <div className="w-16 h-0.5 bg-accent mx-auto mt-4 rounded-full" aria-hidden />
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="aspect-square bg-secondary/50 animate-shimmer" />
      <CardContent className="p-4">
        <div className="h-4 w-3/4 rounded bg-secondary/70 animate-pulse" />
        <div className="mt-2 h-3 w-1/2 rounded bg-secondary/50 animate-pulse" />
        <div className="mt-3 h-4 w-1/4 rounded bg-secondary/50 animate-pulse" />
      </CardContent>
    </Card>
  );
}

export function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi
      .list({ sort: 'newest' })
      .then((data) => setProducts(Array.isArray(data) ? data.slice(0, NEW_ARRIVALS_LIMIT) : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <NewArrivalsSectionHeader />
      {loading ? (
        <HorizontalCarousel aria-label="New arrivals loading" itemMinWidth={CAROUSEL_ITEM_MIN_WIDTH} gap="gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <HorizontalCarouselItem key={i} minWidth={CAROUSEL_ITEM_MIN_WIDTH}>
              <SkeletonCard />
            </HorizontalCarouselItem>
          ))}
        </HorizontalCarousel>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-primary/70 mb-4">No new arrivals yet. Explore our collection!</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
          >
            View all products
          </Link>
        </div>
      ) : (
        <HorizontalCarousel aria-label="New arrivals" itemMinWidth={CAROUSEL_ITEM_MIN_WIDTH} gap="gap-4">
          {products.map((p, index) => (
            <HorizontalCarouselItem key={p._id} minWidth={CAROUSEL_ITEM_MIN_WIDTH}>
              <NewArrivalsProductCard product={p} priority={index < 3} />
            </HorizontalCarouselItem>
          ))}
        </HorizontalCarousel>
      )}
    </>
  );
}

function NewArrivalsProductCard({ product: p, priority }: { product: Product; priority?: boolean }) {
  const hasDiscount =
    p.discountedPrice != null && p.discountedPrice > 0 && p.discountedPrice < p.price;
  const discountPct = hasDiscount
    ? Math.round((1 - (p.discountedPrice ?? 0) / p.price) * 100)
    : 0;

  return (
    <Link
      href={`/products/${p._id}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-2xl"
    >
      <Card className="overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-soft-hover h-full">
        <div className="relative aspect-square bg-secondary/50 overflow-hidden">
          {p.images?.[0] ? (
            <Image
              src={p.images[0] as string}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-300 motion-safe:group-hover:scale-105"
              loading={priority ? 'eager' : 'lazy'}
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary/40 text-sm">
              No image
            </div>
          )}
          {hasDiscount && discountPct > 0 && (
            <span
              className="absolute left-2 top-2 rounded-md bg-accent px-2 py-0.5 text-xs font-bold text-white"
              aria-label={`${discountPct}% off`}
            >
              {discountPct}% OFF
            </span>
          )}
        </div>
        <CardContent className="p-4">
          <p className="font-display font-semibold text-primary line-clamp-2">{p.name}</p>
          <ProductPrice
            price={p.price}
            discountedPrice={p.discountedPrice}
            expectedDeliveryTime={p.expectedDeliveryTime}
            compact
            showDelivery
          />
        </CardContent>
      </Card>
    </Link>
  );
}
