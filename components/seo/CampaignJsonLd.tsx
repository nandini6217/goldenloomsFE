type CampaignJsonLdProps = {
  campaign: {
    name: string;
    description: string;
    url: string;
  };
};

export function CampaignJsonLd({ campaign }: CampaignJsonLdProps) {
  const baseUrl = campaign.url.replace(/\/campaigns\/[^/]+$/, '');
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Campaigns', item: `${baseUrl}/campaigns` },
      { '@type': 'ListItem', position: 3, name: campaign.name, item: campaign.url },
    ],
  };

  const collectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: campaign.name,
    description: campaign.description,
    url: campaign.url,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPage) }}
      />
    </>
  );
}
