type ProductJsonLdProps = {
  product: {
    name: string;
    description: string;
    image?: string;
    price: number;
    availability?: 'InStock' | 'OutOfStock';
    avgRating?: number;
    reviewCount?: number;
    url: string;
  };
};

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    ...(product.image && { image: product.image }),
    url: product.url,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      ...(product.availability && { availability: `https://schema.org/${product.availability}` }),
    },
    ...(product.avgRating != null &&
      product.reviewCount != null &&
      product.reviewCount > 0 && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.avgRating,
          reviewCount: product.reviewCount,
          bestRating: 5,
        },
      }),
  };

  const baseUrl = product.url.replace(/\/products\/[^/]+$/, '');
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${baseUrl}/products` },
      { '@type': 'ListItem', position: 3, name: product.name, item: product.url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
