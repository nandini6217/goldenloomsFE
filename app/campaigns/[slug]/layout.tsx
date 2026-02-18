import type { Metadata } from 'next';
import { CampaignJsonLd } from '@/components/seo/CampaignJsonLd';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type CampaignApi = {
  slug: string;
  name: string;
  description?: string;
  bannerImage?: string | null;
};

async function getCampaign(slug: string): Promise<CampaignApi | null> {
  try {
    const res = await fetch(`${apiUrl}/api/campaigns/${encodeURIComponent(slug)}`, {
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
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) {
    return { title: 'Campaign not found' };
  }
  const title = campaign.name;
  const description = campaign.description
    ? truncate(campaign.description, 155)
    : `${campaign.name} – Golden Looms`;
  const image = campaign.bannerImage;
  return {
    title,
    description,
    alternates: { canonical: `/campaigns/${slug}` },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/campaigns/${slug}`,
      ...(image && {
        images: [{ url: image, width: 1200, height: 630, alt: campaign.name }],
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

export default async function CampaignLayout({ params, children }: Props) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  return (
    <>
      {campaign && (
        <CampaignJsonLd
          campaign={{
            name: campaign.name,
            description: campaign.description || campaign.name,
            url: `${baseUrl}/campaigns/${slug}`,
          }}
        />
      )}
      {children}
    </>
  );
}
