'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authApi, addressesApi, type AddressFromApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function AccountPage() {
  const router = useRouter();
  const { user, isLoggedIn, setUser } = useAuthStore();
  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [addresses, setAddresses] = useState<AddressFromApi[]>([]);
  const [editingAddress, setEditingAddress] = useState<AddressFromApi | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [formAddress, setFormAddress] = useState({
    label: 'Home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace(`/login?returnTo=${encodeURIComponent('/account')}`);
      return;
    }
    if (user) {
      setProfile({ name: user.name, phone: user.phone || '' });
    }
    authApi.me().then((data: { userId?: string; name?: string; email?: string; phone?: string }) => {
      if (data.name !== undefined) setProfile((p) => ({ ...p, name: data.name!, phone: data.phone || '' }));
    }).catch(() => {});
    addressesApi.list().then(setAddresses).catch(() => setAddresses([]));
  }, [isLoggedIn, router, user?.name, user?.phone]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const data = await authApi.updateProfile({ name: profile.name, phone: profile.phone });
      setUser({ id: user!.id, name: data.name, email: data.email, phone: data.phone });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    if (!editingAddress && addingAddress) {
      try {
        const created = await addressesApi.create({
          ...formAddress,
          addressLine2: formAddress.addressLine2 || undefined,
        });
        setAddresses((prev) => [...prev, created]);
        setFormAddress({ label: 'Home', name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
        setAddingAddress(false);
      } catch (e) {
        console.error(e);
      }
      return;
    }
    if (!editingAddress) return;
    try {
      const updated = await addressesApi.update(editingAddress._id, {
        label: formAddress.label,
        name: formAddress.name,
        phone: formAddress.phone,
        addressLine1: formAddress.addressLine1,
        addressLine2: formAddress.addressLine2 || undefined,
        city: formAddress.city,
        state: formAddress.state,
        pincode: formAddress.pincode,
      });
      setAddresses((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));
      setEditingAddress(null);
      setAddingAddress(false);
      setFormAddress({ label: 'Home', name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Remove this address?')) return;
    try {
      await addressesApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      if (editingAddress?._id === id) setEditingAddress(null);
    } catch (e) {
      console.error(e);
    }
  };

  const startAddAddress = () => {
    setEditingAddress(null);
    setAddingAddress(true);
    setFormAddress({ label: 'Home', name: user?.name || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
  };

  const startEditAddress = (a: AddressFromApi) => {
    setAddingAddress(false);
    setEditingAddress(a);
    setFormAddress({
      label: a.label,
      name: a.name,
      phone: a.phone,
      addressLine1: a.addressLine1,
      addressLine2: a.addressLine2 || '',
      city: a.city,
      state: a.state,
      pincode: a.pincode,
    });
  };

  if (!isLoggedIn()) {
    return (
      <div className="container-custom py-10">
        <p className="text-primary/70">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="container-custom py-10">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Account' }]} className="mb-6" />
      <h1 className="font-display text-2xl font-semibold text-primary mb-8">My Account</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-primary/80 text-sm mt-1">{user?.email}</p>
            </div>
            <div>
              <Label htmlFor="account-phone">Phone</Label>
              <Input
                id="account-phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">Quick links</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/orders" className="text-accent hover:underline">
                My orders
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="text-accent hover:underline">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="text-accent hover:underline">
                Checkout
              </Link>
            </li>
          </ul>
        </Card>
      </div>

      <Card className="p-6 mt-8">
        <h2 className="font-display text-lg font-semibold text-primary mb-4">Saved addresses</h2>
        {addresses.length === 0 && !editingAddress && (
          <p className="text-primary/70 text-sm mb-4">No saved addresses. Add one below or at checkout.</p>
        )}
        <ul className="space-y-3 mb-6">
          {addresses.map((a) => (
            <li
              key={a._id}
              className="flex flex-wrap items-start justify-between gap-2 p-3 rounded-[12px] border border-primary/10 bg-primary/[0.02]"
            >
              <div>
                <p className="font-medium text-primary">
                  {a.label} {a.isDefault && '(Default)'}
                </p>
                <p className="text-sm text-primary/80">
                  {a.name}, {a.phone}
                </p>
                <p className="text-sm text-primary/70">
                  {a.addressLine1}
                  {a.addressLine2 ? `, ${a.addressLine2}` : ''}, {a.city}, {a.state} - {a.pincode}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => startEditAddress(a)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeleteAddress(a._id)}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {(addingAddress || editingAddress) && (
          <div className="border-t border-primary/10 pt-4">
            <h3 className="font-medium text-primary mb-3">{editingAddress ? 'Edit address' : 'New address'}</h3>
            <div className="space-y-3 max-w-md">
              <div>
                <Label>Label</Label>
                <Input
                  value={formAddress.label}
                  onChange={(e) => setFormAddress((f) => ({ ...f, label: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formAddress.name}
                    onChange={(e) => setFormAddress((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formAddress.phone}
                    onChange={(e) => setFormAddress((f) => ({ ...f, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Address line 1</Label>
                <Input
                  value={formAddress.addressLine1}
                  onChange={(e) => setFormAddress((f) => ({ ...f, addressLine1: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Address line 2 (optional)</Label>
                <Input
                  value={formAddress.addressLine2}
                  onChange={(e) => setFormAddress((f) => ({ ...f, addressLine2: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formAddress.city}
                    onChange={(e) => setFormAddress((f) => ({ ...f, city: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formAddress.state}
                    onChange={(e) => setFormAddress((f) => ({ ...f, state: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Pincode</Label>
                  <Input
                    value={formAddress.pincode}
                    onChange={(e) => setFormAddress((f) => ({ ...f, pincode: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveAddress}>
                  {editingAddress ? 'Update' : 'Add'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingAddress(null);
                    setAddingAddress(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        {!addingAddress && !editingAddress && (
          <div className="border-t border-primary/10 pt-4">
            <Button variant="outline" size="sm" onClick={startAddAddress}>
              Add new address
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
