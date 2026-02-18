'use client';

import { useEffect, useState } from 'react';
import { ordersApi, type Order } from '@/lib/api';
import { ORDER_STATUSES } from '@/config/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<string>(ORDER_STATUSES[0]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [trackingEdit, setTrackingEdit] = useState<{ id: string; trackingId: string; trackingUrl: string } | null>(null);

  const load = () => {
    setLoading(true);
    ordersApi.list().then(setOrders).catch(() => setOrders([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const updateStatus = async (id: string, status: string, opts?: { trackingId?: string; trackingUrl?: string }) => {
    try {
      await ordersApi.updateStatus(id, status, opts);
      setTrackingEdit(null);
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const saveTracking = (order: Order) => {
    if (!trackingEdit || trackingEdit.id !== order._id) return;
    updateStatus(order._id, order.status, {
      trackingId: trackingEdit.trackingId || undefined,
      trackingUrl: trackingEdit.trackingUrl || undefined,
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o._id)));
    }
  };

  const bulkUpdate = async () => {
    if (selectedIds.size === 0) {
      alert('Select at least one order');
      return;
    }
    setBulkUpdating(true);
    try {
      await ordersApi.bulkUpdateStatus(Array.from(selectedIds), bulkStatus);
      setSelectedIds(new Set());
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to update orders');
    } finally {
      setBulkUpdating(false);
    }
  };

  if (loading) {
    return <p className="text-primary/70">Loading orders...</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">Orders</h1>

      {orders.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-primary/5 rounded-[12px] border border-primary/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === orders.length && orders.length > 0}
              onChange={selectAll}
              className="rounded border-primary/30"
            />
            <span className="text-sm text-primary/80">Select all</span>
          </label>
          <span className="text-sm text-primary/70">
            {selectedIds.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-[12px] border border-primary/20 bg-white px-3 py-2 text-sm"
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>Set to {s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={bulkUpdate}
            disabled={bulkUpdating || selectedIds.size === 0}
            className="rounded-[12px] bg-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {bulkUpdating ? 'Updating...' : 'Update selected'}
          </button>
        </div>
      )}

      <div className="space-y-6">
        {orders.length === 0 ? (
          <p className="text-primary/70">No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="border border-primary/10 rounded-[12px] bg-white p-6 shadow-soft flex flex-wrap gap-4"
            >
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(order._id)}
                  onChange={() => toggleSelect(order._id)}
                  className="rounded border-primary/30 mt-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="font-mono text-sm text-primary/70">Order #{order._id.slice(-8)}</p>
                    <p className="font-semibold text-primary">{order.customerName}</p>
                    <p className="text-sm text-primary/70">{order.email} · {order.phone}</p>
                    <p className="text-sm text-primary/80 mt-1">{order.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      className="rounded-[12px] border border-primary/20 bg-white px-3 py-2 text-sm"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <p className="font-semibold text-accent">₹{order.totalAmount}</p>
                  </div>
                </div>
                <ul className="border-t border-primary/10 pt-4 space-y-1 text-sm text-primary/80">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} × {item.qty} @ ₹{item.priceAtPurchase} = ₹{item.qty * item.priceAtPurchase}
                    </li>
                  ))}
                </ul>
                {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                  <div className="border-t border-primary/10 pt-4 mt-4">
                    {trackingEdit?.id === order._id ? (
                      <div className="flex flex-wrap gap-2 items-end">
                        <div className="min-w-[120px]">
                          <label className="text-xs text-primary/70 block mb-1">Tracking ID</label>
                          <Input
                            value={trackingEdit.trackingId}
                            onChange={(e) =>
                              setTrackingEdit((p) => (p ? { ...p, trackingId: e.target.value } : null))
                            }
                            placeholder="Optional"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="min-w-[200px] flex-1">
                          <label className="text-xs text-primary/70 block mb-1">Tracking URL</label>
                          <Input
                            value={trackingEdit.trackingUrl}
                            onChange={(e) =>
                              setTrackingEdit((p) => (p ? { ...p, trackingUrl: e.target.value } : null))
                            }
                            placeholder="https://..."
                            className="h-9 text-sm"
                          />
                        </div>
                        <Button size="sm" onClick={() => saveTracking(order)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setTrackingEdit(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 items-center">
                        {order.trackingId && (
                          <span className="text-xs text-primary/70">ID: {order.trackingId}</span>
                        )}
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline"
                          >
                            Track
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setTrackingEdit({
                              id: order._id,
                              trackingId: order.trackingId || '',
                              trackingUrl: order.trackingUrl || '',
                            })
                          }
                          className="text-xs text-accent hover:underline"
                        >
                          {order.trackingId || order.trackingUrl ? 'Edit tracking' : 'Add tracking'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-primary/60 mt-2">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
