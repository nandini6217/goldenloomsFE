import type { Metadata } from 'next';
import { ProductsListJsonLd } from '@/components/seo/ProductsListJsonLd';

export const metadata: Metadata = {
  title: 'Shop All',
  description:
    'Explore our resin jewelry and woolen handloom collections. Handcrafted resin pieces and traditional handloom heritage.',
  alternates: { canonical: '/products' },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProductsListJsonLd />
      {children}
    </>
  );
}
