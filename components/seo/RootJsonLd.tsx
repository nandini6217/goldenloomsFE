const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || 'Golden Looms';

const organization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: brandName,
  url: siteUrl,
  description:
    'Where Resin Elegance Meets Handloom Heritage. Premium handcrafted resin jewelry and woolen handloom products.',
};

const website = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: brandName,
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/products?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export function RootJsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organization),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(website),
        }}
      />
    </>
  );
}
