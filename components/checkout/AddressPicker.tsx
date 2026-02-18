'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AddressFromApi } from '@/types';
import type { UseFormRegister, UseFormSetValue, UseFormGetValues, FieldErrors } from 'react-hook-form';

type FormValues = {
  customerName: string;
  phone: string;
  email: string;
  address?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

type AddressPickerProps = {
  addresses: AddressFromApi[];
  selectedAddressId: string | null;
  onSelectedAddressIdChange: (id: string | null) => void;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  getValues: UseFormGetValues<FormValues>;
  errors: FieldErrors<FormValues>;
  userEmail?: string;
  isLoggedIn: boolean;
  saveAddressForLater: boolean;
  onSaveAddressForLaterChange: (v: boolean) => void;
  formatAddress: (a: AddressFromApi) => string;
};

export function AddressPicker({
  addresses,
  selectedAddressId,
  onSelectedAddressIdChange,
  register,
  setValue,
  getValues,
  errors,
  userEmail,
  isLoggedIn,
  saveAddressForLater,
  onSaveAddressForLaterChange,
  formatAddress,
}: AddressPickerProps) {
  return (
    <>
      {addresses.length > 0 && (
        <div>
          <Label>Deliver to</Label>
          <Select
            value={selectedAddressId ?? 'new'}
            onValueChange={(v) => onSelectedAddressIdChange(v === 'new' ? null : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select address" />
            </SelectTrigger>
            <SelectContent>
              {addresses.map((a) => (
                <SelectItem key={a._id} value={a._id}>
                  {a.label} – {a.city}, {a.state} {a.isDefault && '(Default)'}
                </SelectItem>
              ))}
              <SelectItem value="new">Add new address</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="customerName">Name</Label>
        <Input id="customerName" {...register('customerName')} className="mt-1" />
        {errors.customerName && <p className="text-sm text-red-600 mt-1">{errors.customerName.message}</p>}
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register('phone')} className="mt-1" />
        {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>}
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} className="mt-1" />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
      </div>
      {selectedAddressId ? (
        <div>
          <Label>Address</Label>
          <p className="mt-1 text-sm text-primary/90 bg-secondary/30 rounded-[12px] px-3 py-2">{getValues('address')}</p>
        </div>
      ) : (
        <>
          <div>
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input id="addressLine1" {...register('addressLine1')} className="mt-1" />
            {errors.addressLine1 && <p className="text-sm text-red-600 mt-1">{errors.addressLine1.message}</p>}
          </div>
          <div>
            <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
            <Input id="addressLine2" {...register('addressLine2')} className="mt-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register('city')} className="mt-1" />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register('state')} className="mt-1" />
              {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register('pincode')} className="mt-1" />
              {errors.pincode && <p className="text-sm text-red-600 mt-1">{errors.pincode.message}</p>}
            </div>
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="saveAddressForLater"
                checked={saveAddressForLater}
                onChange={(e) => onSaveAddressForLaterChange(e.target.checked)}
                className="rounded border-primary/30"
              />
              <Label htmlFor="saveAddressForLater" className="font-normal text-primary/80">
                Save this address for later
              </Label>
            </div>
          )}
        </>
      )}
    </>
  );
}
