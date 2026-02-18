import type { AddressFromApi } from '@/types';

export function formatAddress(a: AddressFromApi): string {
  const line2 = a.addressLine2?.trim() ? `, ${a.addressLine2}` : '';
  return `${a.addressLine1}${line2}, ${a.city}, ${a.state} - ${a.pincode}`;
}
