'use client';

import { useEffect, useState } from 'react';
import { campaignsApi, productsApi, type CampaignFromApi, type ProductFromApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const emptyForm = {
  slug: '',
  name: '',
  description: '',
  bannerImage: '',
  productIds: [] as string[],
  couponCode: '',
  startDate: '',
  endDate: '',
  isActive: true,
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignFromApi[]>([]);
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CampaignFromApi | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadCampaigns = () => {
    setLoading(true);
    campaignsApi.listAll().then(setCampaigns).catch(() => setCampaigns([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCampaigns();
    productsApi.list().then(setProducts).catch(() => setProducts([]));
  }, []);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(emptyForm);
  };

  const openEdit = (c: CampaignFromApi) => {
    setEditing(c);
    setCreating(false);
    setForm({
      slug: c.slug,
      name: c.name,
      description: c.description ?? '',
      bannerImage: c.bannerImage ?? '',
      productIds: c.productIds ?? [],
      couponCode: c.couponCode ?? '',
      startDate: c.startDate ? c.startDate.slice(0, 16) : '',
      endDate: c.endDate ? c.endDate.slice(0, 16) : '',
      isActive: c.isActive ?? true,
    });
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const saveCreate = async () => {
    if (!form.slug.trim() || !form.name.trim()) return;
    try {
      await campaignsApi.create({
        slug: form.slug.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        bannerImage: form.bannerImage.trim() || undefined,
        productIds: form.productIds,
        couponCode: form.couponCode.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isActive: form.isActive,
      });
      setCreating(false);
      loadCampaigns();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err?.response?.data?.error ?? 'Failed to create campaign');
    }
  };

  const saveEdit = async () => {
    if (!editing || !form.slug.trim() || !form.name.trim()) return;
    try {
      await campaignsApi.update(editing._id, {
        slug: form.slug.trim().toLowerCase(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        bannerImage: form.bannerImage.trim() || undefined,
        productIds: form.productIds,
        couponCode: form.couponCode.trim() || undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        isActive: form.isActive,
      });
      setEditing(null);
      loadCampaigns();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      alert(err?.response?.data?.error ?? 'Failed to update campaign');
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await campaignsApi.delete(id);
      setEditing(null);
      loadCampaigns();
    } catch (e) {
      console.error(e);
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl font-semibold text-primary">Campaigns</h1>
        <Button onClick={openCreate} variant="accent">Add campaign</Button>
      </div>

      {creating && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">New campaign</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Slug (URL path, e.g. valentines)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                className="mt-1"
                placeholder="valentines"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
                placeholder="Valentine's Day"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
                placeholder="Short description for the campaign"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Banner image URL (optional)</Label>
              <Input
                value={form.bannerImage}
                onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                className="mt-1"
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Coupon code to show (optional)</Label>
              <Input
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                className="mt-1"
                placeholder="LOVE20"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </Label>
            </div>
            <div>
              <Label>Start date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Products in this campaign</Label>
              <p className="text-sm text-primary/60 mt-1 mb-2">Select products to feature. Order is preserved.</p>
              <div className="max-h-48 overflow-y-auto border border-primary/20 rounded-[12px] p-3 space-y-2">
                {products.length === 0 ? (
                  <p className="text-sm text-primary/60">No products. Add products first.</p>
                ) : (
                  products.map((p) => (
                    <label key={p._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.productIds.includes(p._id)}
                        onChange={() => toggleProduct(p._id)}
                        className="rounded"
                      />
                      <span className="text-sm text-primary">{p.name}</span>
                      <span className="text-primary/60 text-xs">₹{p.price}</span>
                    </label>
                  ))
                )}
              </div>
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
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Edit campaign</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Slug (URL path)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Banner image URL (optional)</Label>
              <Input
                value={form.bannerImage}
                onChange={(e) => setForm({ ...form, bannerImage: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Coupon code (optional)</Label>
              <Input
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                Active
              </Label>
            </div>
            <div>
              <Label>Start date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>End date (optional)</Label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Products in this campaign</Label>
              <div className="max-h-48 overflow-y-auto border border-primary/20 rounded-[12px] p-3 space-y-2 mt-1">
                {products.map((p) => (
                  <label key={p._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p._id)}
                      onChange={() => toggleProduct(p._id)}
                      className="rounded"
                    />
                    <span className="text-sm text-primary">{p.name}</span>
                    <span className="text-primary/60 text-xs">₹{p.price}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveEdit}>Update</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="ghost" className="text-red-600" onClick={() => editing && deleteCampaign(editing._id)}>Delete</Button>
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
                <th className="text-left p-3 text-sm font-medium text-primary">Slug</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Name</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Products</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Coupon</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Dates</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Active</th>
                <th className="p-3 text-sm font-medium text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-primary/60">
                    No campaigns yet. Add one to get started.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id} className="border-t border-primary/10">
                    <td className="p-3 font-medium text-primary">{c.slug}</td>
                    <td className="p-3 text-primary/80">{c.name}</td>
                    <td className="p-3">{(c.productIds ?? []).length} products</td>
                    <td className="p-3">{c.couponCode ?? '—'}</td>
                    <td className="p-3 text-sm">
                      {formatDate(c.startDate ?? null)} → {formatDate(c.endDate ?? null)}
                    </td>
                    <td className="p-3">{c.isActive ? 'Yes' : 'No'}</td>
                    <td className="p-3 flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Edit</Button>
                      <a href={`/campaigns/${c.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline">
                        View
                      </a>
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
