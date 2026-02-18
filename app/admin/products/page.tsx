'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhotoUploader } from '@/components/admin/PhotoUploader';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  discountedPrice?: number | null;
  expectedDeliveryTime?: string | null;
  description?: string;
  images?: string[];
  isFeatured?: boolean;
  stock?: number;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'RESIN' as 'RESIN' | 'HANDLOOM',
    price: 0,
    discountedPrice: null as number | null,
    expectedDeliveryTime: '7-10 days',
    description: '',
    images: [] as string[],
    isFeatured: false,
    stock: 0,
  });

  const load = () => {
    setLoading(true);
    productsApi.list().then(setProducts).catch(() => setProducts([])).finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      category: 'RESIN',
      price: 0,
      discountedPrice: null,
      expectedDeliveryTime: '7-10 days',
      description: '',
      images: [],
      isFeatured: false,
      stock: 0,
    });
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setCreating(false);
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category as 'RESIN' | 'HANDLOOM',
      price: p.price,
      discountedPrice: p.discountedPrice ?? null,
      expectedDeliveryTime: p.expectedDeliveryTime ?? '7-10 days',
      description: p.description || '',
      images: p.images ?? [],
      isFeatured: p.isFeatured || false,
      stock: p.stock ?? 0,
    });
  };

  const saveCreate = async () => {
    if (!form.name || !form.slug || form.price <= 0) return;
    try {
      await productsApi.create(form);
      setCreating(false);
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to create');
    }
  };

  const saveEdit = async () => {
    if (!editing || !form.name || !form.slug || form.price <= 0) return;
    try {
      await productsApi.update(editing._id, form);
      setEditing(null);
      load();
    } catch (e) {
      console.error(e);
      alert('Failed to update');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productsApi.delete(id);
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
        <h1 className="font-display text-2xl font-semibold text-primary">Products</h1>
        <Button onClick={openCreate} variant="accent">Add product</Button>
      </div>

      {creating && (
        <Card className="mb-8 p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">New product</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" placeholder="lowercase-with-dashes" />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="flex h-11 w-full rounded-[12px] border border-primary/20 bg-white px-4"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as 'RESIN' | 'HANDLOOM' })}
              >
                <option value="RESIN">RESIN</option>
                <option value="HANDLOOM">HANDLOOM</option>
              </select>
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Discounted price (optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty for no discount"
                value={form.discountedPrice ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, discountedPrice: v === '' ? null : Number(v) || null });
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expected delivery time</Label>
              <Input
                value={form.expectedDeliveryTime}
                onChange={(e) => setForm({ ...form, expectedDeliveryTime: e.target.value })}
                className="mt-1"
                placeholder="e.g. 7-10 days"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="feat" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <Label htmlFor="feat">Featured</Label>
            </div>
            <div className="sm:col-span-2">
              <Label>Photos</Label>
              <div className="mt-1">
                <PhotoUploader
                  value={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                />
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
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Edit product</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="flex h-11 w-full rounded-[12px] border border-primary/20 bg-white px-4"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as 'RESIN' | 'HANDLOOM' })}
              >
                <option value="RESIN">RESIN</option>
                <option value="HANDLOOM">HANDLOOM</option>
              </select>
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div>
              <Label>Discounted price (optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty for no discount"
                value={form.discountedPrice ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, discountedPrice: v === '' ? null : Number(v) || null });
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expected delivery time</Label>
              <Input
                value={form.expectedDeliveryTime}
                onChange={(e) => setForm({ ...form, expectedDeliveryTime: e.target.value })}
                className="mt-1"
                placeholder="e.g. 7-10 days"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>Stock</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) || 0 })} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="featEdit" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              <Label htmlFor="featEdit">Featured</Label>
            </div>
            <div className="sm:col-span-2">
              <Label>Photos</Label>
              <div className="mt-1">
                <PhotoUploader
                  value={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={saveEdit}>Update</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="ghost" className="text-red-600" onClick={() => deleteProduct(editing._id)}>Delete</Button>
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
                <th className="text-left p-3 text-sm font-medium text-primary">Name</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Category</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Price</th>
                <th className="text-left p-3 text-sm font-medium text-primary">Stock</th>
                <th className="p-3 text-sm font-medium text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-primary/10">
                  <td className="p-3 text-primary">{p.name}</td>
                  <td className="p-3 text-primary/80">{p.category}</td>
                  <td className="p-3">₹{p.price}</td>
                  <td className="p-3">{p.stock ?? 0}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>Edit</Button>
                    <Link href={`/products/${p._id}`} target="_blank" className="ml-2 text-sm text-accent hover:underline">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
