import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart',
  description: 'Your cart – Golden Looms. Review and checkout your selected items.',
  alternates: { canonical: '/cart' },
  robots: { index: false, follow: true },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
