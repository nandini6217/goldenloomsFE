const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';

const breadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
    { '@type': 'ListItem', position: 2, name: 'Campaigns', item: `${baseUrl}/campaigns` },
  ],
};

export function CampaignsListJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
    />
  );
}
