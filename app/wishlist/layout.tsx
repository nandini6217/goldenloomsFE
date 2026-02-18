import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'Your saved items – Golden Looms.',
  alternates: { canonical: '/wishlist' },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
