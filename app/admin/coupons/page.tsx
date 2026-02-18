'use client';

import { useEffect, useState } from 'react';
import { couponsApi, type CouponFromApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
  value: 0,
  minOrder: 0,
  validFrom: '',
  validTo: '',
  usageLimit: '',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CouponFromApi | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => {
    setLoading(true);
    couponsApi.list().then(setCoupons).catch(() => setCoupons([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (c: CouponFromApi) => {
    setEditing(c);
    setCreating(false);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder ?? 0,
      validFrom: c.validFrom ? c.validFrom.slice(0, 16) : '',
      validTo: c.validTo ? c.validTo.slice(0, 16) : '',
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
    });
  };

  const saveCreate = async () => {
    if (!form.code.trim() || form.value < 0) return;
    try {
      await couponsApi.create({
        code: form.code.trim(),
        type: form.type,
        value: form.value,
        minOrder: form.minOrder,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
      });
      setCreating(false);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err?.response?.data?.error ?? 'Failed to create coupon');
    }
  };

  const saveEdit = async () => {
    if (!editing || !form.code.trim() || form.value < 0) return;
    try {
      await couponsApi.update(editing._id, {
        code: form.code.trim(),
        type: form.type,
        value: form.value,
        minOrder: form.minOrder,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
      });
      setEditing(null);
      load();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err?.response?.data?.error ?? 'Failed to update coupon');
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    try {
      await couponsApi.delete(id);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-primary">Coupons</h1>
        <Button onClick={openCreate} variant="accent">Add coupon</Button>
      </div>

      {creating && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">New coupon</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="mt-1"
                placeholder="SAVE20"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="flex h-11 w-full rounded-[12px] border border-primary/20 bg-white px-4"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </div>
            <div>
              <Label>Value {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</Label>
              <Input
                type="number"
                min={0}
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Min order (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid from (optional)</Label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid to (optional)</Label>
              <Input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Usage limit (optional, leave empty for unlimited)</Label>
              <Input
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="mt-1"
                placeholder="Unlimited"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveCreate}>Save</Button>
            <Button variant="outline" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {editing && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Edit coupon</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="flex h-11 w-full rounded-[12px] border border-primary/20 bg-white px-4"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'PERCENTAGE' | 'FIXED' })}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed amount</option>
              </select>
            </div>
            <div>
              <Label>Value {form.type === 'PERCENTAGE' ? '(%)' : '(₹)'}</Label>
              <Input
                type="number"
                min={0}
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Min order (₹)</Label>
              <Input
                type="number"
                min={0}
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid from (optional)</Label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Valid to (optional)</Label>
              <Input
                type="datetime-local"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Usage limit (optional)</Label>
              <Input
                type="number"
                min={0}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                className="mt-1"
                placeholder="Unlimited"
              />
            </div>
            <div className="sm:col-span-2 text-sm text-primary/70">
              Used: {editing.usedCount} {editing.usageLimit != null ? `/ ${editing.usageLimit}` : ''}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveEdit}>Update</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="ghost" className="text-red-600" onClick={() => deleteCoupon(editing._id)}>Delete</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-primary/70">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-primary/10 rounded-[12px] overflow-hidden">
            <thead className="bg-primary/5">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-primary">Code</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Type</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Value</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Min order</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Valid</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Usage</th>
                <th className="p-3 text-sm font-medium text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-primary/60">
                    No coupons yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id} className="border-t border-primary/10">
                    <td className="p-3 font-medium text-primary">{c.code}</td>
                    <td className="p-3 text-primary/80">{c.type}</td>
                    <td className="p-3">
                      {c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}
                    </td>
                    <td className="p-3">₹{c.minOrder ?? 0}</td>
                    <td className="p-3 text-sm">
                      {formatDate(c.validFrom)} → {formatDate(c.validTo)}
                    </td>
                    <td className="p-3">
                      {c.usedCount}
                      {c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                    </td>
                    <td className="p-3">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
