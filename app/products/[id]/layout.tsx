import type { Metadata } from 'next';
import { ProductJsonLd } from '@/components/seo/ProductJsonLd';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ProductApi = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  description?: string;
  images?: string[];
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
};

async function getProduct(id: string): Promise<ProductApi | null> {
  try {
    const res = await fetch(`${apiUrl}/api/products/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trim() + '...';
}

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: 'Product not found' };
  }
  const title = product.name;
  const description = product.description
    ? truncate(product.description, 155)
    : `${product.name} – Golden Looms`;
  const image = product.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/products/${id}`,
      ...(image && {
        images: [{ url: image, width: 1200, height: 630, alt: product.name }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      {product && (
        <ProductJsonLd
          product={{
            name: product.name,
            description: product.description || product.name,
            image: product.images?.[0],
            price: product.price,
            availability: product.stock ? (product.stock > 0 ? 'InStock' : 'OutOfStock') : undefined,
            avgRating: product.avgRating,
            reviewCount: product.reviewCount,
            url: `${baseUrl}/products/${id}`,
          }}
        />
      )}
      {children}
    </>
  );
}
