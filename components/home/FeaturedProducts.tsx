'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { ProductPrice } from '@/components/product/ProductPrice';

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

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    productsApi.list({ featured: true }).then(setProducts).catch(() => setProducts([]));
  }, []);

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-secondary/50" />
            <CardContent className="p-4">
              <p className="font-display font-semibold text-primary">Loading...</p>
              <p className="text-sm text-primary/70">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.slice(0, 6).map((p) => (
        <Link key={p._id} href={`/products/${p._id}`}>
          <Card className="overflow-hidden transition-shadow hover:shadow-soft-hover">
            <div className="aspect-square bg-secondary/50 flex items-center justify-center text-primary/40 text-sm overflow-hidden">
              {p.images?.[0] ? (
                <img
                  src={p.images[0] as string}
                  alt={p.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                'No image'
              )}
            </div>
            <CardContent className="p-4">
              <p className="font-display font-semibold text-primary">{p.name}</p>
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
      ))}
    </div>
  );
}
