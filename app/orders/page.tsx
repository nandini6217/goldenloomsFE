'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi, type Order } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function MyOrdersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?returnTo=${encodeURIComponent('/orders')}`);
      return;
    }
    ordersApi
      .getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, router]);

  if (!isLoggedIn()) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">My Orders</h1>

      {loading ? (
        <p className="text-primary/70">Loading...</p>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-primary/80 mb-4">You haven&apos;t placed any orders yet.</p>
          <Button asChild>
            <Link href="/products">Start shopping</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order._id} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <Link
                  href={`/orders/${order._id}`}
                  className="font-mono text-sm text-accent hover:underline"
                >
                  Order #{order._id.slice(-8)}
                </Link>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {order.status}
                </span>
              </div>
              <ul className="space-y-1 text-sm text-primary/80 mb-2">
                {order.items.map((item, i) => (
                  <li key={i}>
                    {item.name} × {item.qty} @ ₹{item.priceAtPurchase}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-accent">Total: ₹{order.totalAmount}</p>
              <p className="text-xs text-primary/60 mt-2">
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href={`/orders/${order._id}`}>View details</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
