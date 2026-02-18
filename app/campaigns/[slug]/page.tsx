'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { campaignsApi, type CampaignWithProducts } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductPrice } from '@/components/product/ProductPrice';
import { Breadcrumbs } from '@/components/Breadcrumbs';

type Product = CampaignWithProducts['products'][number];

export default function CampaignPage() {
  const params = useParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const [campaign, setCampaign] = useState<CampaignWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    campaignsApi
      .getBySlug(slug)
      .then(setCampaign)
      .catch(() => setCampaign(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const copyCoupon = () => {
    if (!campaign?.couponCode) return;
    navigator.clipboard.writeText(campaign.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="container-custom px-4 py-6 sm:px-6 sm:py-10">
        <div className="h-64 bg-primary/10 rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-secondary/50 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 bg-primary/10 rounded w-3/4 mb-2" />
                <div className="h-4 bg-primary/10 rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container-custom px-4 py-12 sm:px-6 sm:py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary mb-4">Campaign not found</h1>
        <p className="text-primary/70 mb-6">This campaign may have ended or the link is incorrect.</p>
        <Button asChild>
          <Link href="/products">Shop all products</Link>
        </Button>
      </div>
    );
  }

  const products = campaign.products ?? [];

  return (
    <div className="container-custom px-4 py-6 sm:px-6 sm:py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Campaigns', href: '/campaigns' },
          { label: campaign.name },
        ]}
        className="mb-6"
      />
      {/* Campaign banner */}
      <section className="mb-8 sm:mb-10">
        <div className="rounded-xl overflow-hidden bg-primary/10 aspect-[4/1] min-h-[96px] sm:aspect-[3/1] sm:min-h-[140px] md:min-h-[160px] flex items-center justify-center relative">
          {campaign.bannerImage ? (
            <Image
              src={campaign.bannerImage}
              alt={campaign.name}
              fill
              sizes="100vw"
              className="object-cover object-center"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary/40 font-display text-xl sm:text-2xl px-2">
              {campaign.name}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4 sm:p-6">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-white drop-shadow break-words">
              {campaign.name}
            </h1>
            {campaign.description && (
              <p className="text-white/90 mt-1 max-w-2xl text-sm sm:text-base line-clamp-2 sm:line-clamp-none">
                {campaign.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Coupon code block */}
      {campaign.couponCode && (
        <div className="mb-8 sm:mb-10 p-4 rounded-xl bg-accent/10 border border-accent/30 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <p className="text-primary font-medium text-sm sm:text-base min-w-0 break-words">
            Use code <strong className="font-display text-base sm:text-lg text-accent">{campaign.couponCode}</strong> at checkout
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyCoupon} className="w-full sm:w-auto">
              {copied ? 'Copied!' : 'Copy code'}
            </Button>
            <Link href="/cart" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto">Go to cart</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Product grid */}
      <section>
        <h2 className="font-display text-xl font-semibold text-primary mb-6">Products in this campaign</h2>
        {products.length === 0 ? (
          <p className="text-primary/70 py-12 text-center">No products in this campaign yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p: Product) => (
              <Card key={p._id} className="overflow-hidden transition-shadow hover:shadow-soft-hover h-full">
                <Link href={`/products/${p._id}`} className="block">
                  <div className="aspect-square bg-secondary/50 flex items-center justify-center text-primary/40 text-sm relative">
                    {p.stock !== undefined && p.stock <= 0 && (
                      <span className="absolute inset-0 bg-primary/60 flex items-center justify-center z-10 text-white font-semibold text-sm uppercase tracking-wide">
                        Out of stock
                      </span>
                    )}
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
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {p.avgRating != null && p.avgRating > 0 && (
                        <span className="text-amber-600 text-sm">★ {p.avgRating}</span>
                      )}
                      {p.reviewCount != null && p.reviewCount > 0 && (
                        <span className="text-primary/60 text-xs">({p.reviewCount})</span>
                      )}
                    </div>
                    <div className="mt-1">
                      <ProductPrice
                        price={p.price}
                        discountedPrice={p.discountedPrice}
                        expectedDeliveryTime={p.expectedDeliveryTime}
                        compact
                        showDelivery
                      />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
