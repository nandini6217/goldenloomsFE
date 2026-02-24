'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { productsApi, reviewsApi, wishlistApi, deliveryApi, type ProductFromApi, type ReviewFromApi } from '@/lib/api';
import { eventsApi } from '@/lib/api/events';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductPrice } from '@/components/product/ProductPrice';
import { StarRating } from '@/components/product/StarRating';
import { ReviewForm } from '@/components/product/ReviewForm';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { addRecentlyViewed, getRecentlyViewedIds } from '@/lib/recently-viewed';
import { Card, CardContent } from '@/components/ui/card';
import { useProduct } from '@/hooks/useProduct';
import { useReviews } from '@/hooks/useReviews';
import { useWishlist } from '@/hooks/useWishlist';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: product, loading, refetch: refetchProduct } = useProduct(id);
  const { reviews, avgRating, reviewCount, refetch: refetchReviews } = useReviews(id);
  const hasToken = !!useAuthStore((s) => s.token);
  const { productIds: wishlistIds, refetch: refetchWishlist } = useWishlist(hasToken);

  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState<string | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<ProductFromApi[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductFromApi[]>([]);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, { yes: number; no: number }>>({});
  const [votedHelpful, setVotedHelpful] = useState<Set<string>>(new Set());
  const [addQty, setAddQty] = useState(1);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const setItems = useCartStore((s) => s.setItems);
  const updateQty = useCartStore((s) => s.updateQty);
  const cartItems = useCartStore((s) => s.items);
  const cartLine = product ? cartItems.find((i) => i.productId === product._id) : null;
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!id) return;
    addRecentlyViewed(id);
  }, [id]);

  useEffect(() => {
    if (!product) return;
    productsApi.list({ category: product.category }).then((list: ProductFromApi[]) => {
      setSimilarProducts(list.filter((p) => p._id !== product._id).slice(0, 4));
    }).catch(() => setSimilarProducts([]));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    eventsApi?.track?.({
      event: 'product_view',
      productId: product._id,
      productName: product.name,
      category: product.category,
      source: 'product_page',
    });
  }, [product?._id]);

  useEffect(() => {
    if (!product) return;
    const recentIds = getRecentlyViewedIds().filter((rid) => rid !== product._id).slice(0, 6);
    if (recentIds.length === 0) {
      setRecentProducts([]);
      return;
    }
    productsApi.list({ ids: recentIds.join(',') }).then((list: ProductFromApi[]) => {
      const order = recentIds.reduce((acc, rid, i) => ({ ...acc, [rid]: i }), {} as Record<string, number>);
      setRecentProducts(
        list.sort((a, b) => (order[a._id] ?? 99) - (order[b._id] ?? 99))
      );
    }).catch(() => setRecentProducts([]));
  }, [product]);

  const toggleWishlist = async () => {
    if (!product || !isLoggedIn()) return;
    try {
      const inList = wishlistIds.has(product._id);
      if (inList) await wishlistApi.remove(product._id);
      else {
        await wishlistApi.add(product._id);
        eventsApi?.track?.({
          event: 'add_to_wishlist',
          productId: product._id,
          productName: product.name,
          category: product.category,
          source: 'product_page',
        });
      }
      refetchWishlist();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="aspect-square bg-secondary/50 rounded-[12px] animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-primary/10 rounded w-3/4" />
            <div className="h-4 bg-primary/10 rounded w-1/4" />
            <div className="h-24 bg-primary/10 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shop', href: '/products' },
          { label: product.category, href: `/products?category=${product.category}` },
          { label: product.name },
        ]}
        className="mb-6"
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <ProductGallery
            images={product.images?.length ? product.images as string[] : []}
            productName={product.name}
            productId={product._id}
            category={product.category}
            onZoom={() => {
              eventsApi?.track?.({
                event: 'product_zoom',
                productId: product._id,
                productName: product.name,
                category: product.category,
                source: 'product_page',
              });
            }}
          />
        </div>
        <div className="md:sticky md:top-20 md:self-start">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-semibold text-primary">{product.name}</h1>
            <StarRating value={product.avgRating ?? avgRating} count={product.reviewCount ?? reviewCount} />
            {isLoggedIn() && (
              <button
                type="button"
                onClick={toggleWishlist}
                className="p-2 rounded-full border border-primary/20 hover:bg-primary/5"
                aria-label={wishlistIds.has(product._id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlistIds.has(product._id) ? (
                  <span className="text-red-500">❤</span>
                ) : (
                  <span className="text-primary/60">♡</span>
                )}
              </button>
            )}
          </div>
          <div className="mb-4 mt-2">
            <ProductPrice
              price={product.price}
              discountedPrice={product.discountedPrice}
              expectedDeliveryTime={product.expectedDeliveryTime}
              showDelivery
            />
          </div>
          <p className="text-primary/80 text-sm mb-6">{product.description || 'No description.'}</p>
          <p className="text-sm text-primary/60 mb-6">
            Category: {product.category}
            {product.stock != null && (
              <>
                {' · '}
                <span className={product.stock === 0 ? 'text-red-600 font-medium' : product.stock <= 5 ? 'text-amber-600 font-medium' : ''}>
                  {product.stock === 0 ? 'Out of stock' : `Stock: ${product.stock}`}
                </span>
              </>
            )}
          </p>
          <div className="mb-6 p-4 rounded-[12px] border border-primary/10 bg-primary/[0.02]">
            <p className="text-sm font-medium text-primary mb-2">Check delivery to your pincode</p>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setDeliveryMessage(null);
                }}
                className="h-10 max-w-[140px]"
                maxLength={6}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10"
                disabled={checkingDelivery || pincode.length !== 6}
                onClick={async () => {
                  setCheckingDelivery(true);
                  setDeliveryMessage(null);
                  try {
                    const res = await deliveryApi.check(pincode);
                    setDeliveryMessage(res.message);
                  } catch {
                    setDeliveryMessage('Could not check delivery.');
                  } finally {
                    setCheckingDelivery(false);
                  }
                }}
              >
                {checkingDelivery ? 'Checking...' : 'Check'}
              </Button>
            </div>
            {deliveryMessage && (
              <p className={`text-sm mt-2 ${deliveryMessage.includes('Delivery by') ? 'text-green-700' : 'text-primary/80'}`}>
                {deliveryMessage}
              </p>
            )}
          </div>
          {product.stock !== undefined && product.stock <= 0 ? (
            <Button variant="outline" size="lg" disabled>
              Out of stock
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 border border-primary/20 rounded-[12px]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartLine) {
                      updateQty(product._id, Math.max(1, cartLine.qty - 1));
                    } else {
                      setAddQty((q) => Math.max(1, q - 1));
                    }
                  }}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-sm font-medium tabular-nums" aria-live="polite">
                  {cartLine ? cartLine.qty : addQty}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const maxQty = product.stock != null ? product.stock : 99;
                    if (cartLine) {
                      updateQty(product._id, Math.min(maxQty, cartLine.qty + 1));
                    } else {
                      setAddQty((q) => Math.min(maxQty, q + 1));
                    }
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {cartLine ? (
                <Button variant="accent" size="sm" className="h-10 px-5" asChild>
                  <Link href="/cart">View cart</Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-5"
                  onClick={() => {
                    const effectivePrice =
                      product.discountedPrice != null &&
                      product.discountedPrice > 0 &&
                      product.discountedPrice < product.price
                        ? product.discountedPrice
                        : product.price;
                    addItem({
                      productId: product._id,
                      name: product.name,
                      price: effectivePrice,
                      qty: addQty,
                      image: product.images?.[0],
                    });
                    eventsApi?.track?.({
                      event: 'add_to_cart',
                      productId: product._id,
                      productName: product.name,
                      category: product.category,
                      qty: addQty,
                      source: 'product_page',
                    });
                  }}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t border-primary/10 pt-8">
        <h2 className="font-display text-xl font-semibold text-primary mb-4">Reviews</h2>
        <StarRating value={avgRating} count={reviewCount} />
        {reviewCount > 0 && (
          <ul className="mt-6 space-y-4">
            {reviews.map((r) => {
              const counts = helpfulCounts[r._id] ?? { yes: r.helpfulYes ?? 0, no: r.helpfulNo ?? 0 };
              const voted = votedHelpful.has(r._id);
              return (
                <li key={r._id} className="border border-primary/10 rounded-[12px] p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {r.user?.name && <span className="text-sm text-primary/70">{r.user.name}</span>}
                  </div>
                  {r.comment && <p className="text-primary/80 text-sm">{r.comment}</p>}
                  <p className="text-xs text-primary/50 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs text-primary/60 mt-2">Was this helpful?</p>
                  <div className="flex gap-3 mt-1">
                    <button
                      type="button"
                      disabled={voted}
                      onClick={async () => {
                        if (voted) return;
                        try {
                          const res = await reviewsApi.helpful(r._id, true);
                          setHelpfulCounts((prev) => ({ ...prev, [r._id]: { yes: res.helpfulYes, no: res.helpfulNo } }));
                          setVotedHelpful((s) => new Set(s).add(r._id));
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-accent hover:underline disabled:opacity-50 disabled:cursor-default"
                    >
                      Yes ({counts.yes})
                    </button>
                    <button
                      type="button"
                      disabled={voted}
                      onClick={async () => {
                        if (voted) return;
                        try {
                          const res = await reviewsApi.helpful(r._id, false);
                          setHelpfulCounts((prev) => ({ ...prev, [r._id]: { yes: res.helpfulYes, no: res.helpfulNo } }));
                          setVotedHelpful((s) => new Set(s).add(r._id));
                        } catch {
                          // ignore
                        }
                      }}
                      className="text-primary/70 hover:underline disabled:opacity-50 disabled:cursor-default"
                    >
                      No ({counts.no})
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <ReviewForm productId={id} isLoggedIn={isLoggedIn()} onSubmitted={refetchReviews} />
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-12 border-t border-primary/10 pt-8">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {similarProducts.map((p) => (
              <Link key={p._id} href={`/products/${p._id}`}>
                <Card className="overflow-hidden h-full transition-shadow hover:shadow-soft-hover">
                  <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/40 text-sm">No image</div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-primary text-sm line-clamp-2">{p.name}</p>
                    <ProductPrice
                      price={p.price}
                      discountedPrice={p.discountedPrice}
                      expectedDeliveryTime={p.expectedDeliveryTime}
                      showDelivery={false}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentProducts.length > 0 && (
        <div className="mt-12 border-t border-primary/10 pt-8">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recentProducts.map((p) => (
              <Link key={p._id} href={`/products/${p._id}`}>
                <Card className="overflow-hidden h-full transition-shadow hover:shadow-soft-hover">
                  <div className="relative aspect-square bg-secondary/50 overflow-hidden">
                    {p.images?.[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/40 text-sm">No image</div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-medium text-primary text-sm line-clamp-2">{p.name}</p>
                    <ProductPrice
                      price={p.price}
                      discountedPrice={p.discountedPrice}
                      expectedDeliveryTime={p.expectedDeliveryTime}
                      showDelivery={false}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
