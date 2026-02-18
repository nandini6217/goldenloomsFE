import type { Metadata } from 'next';
import { CampaignsListJsonLd } from '@/components/seo/CampaignsListJsonLd';

export const metadata: Metadata = {
  title: 'Campaigns',
  description:
    'Discover current campaigns and special offers on resin jewelry and handloom collections at Golden Looms.',
  alternates: { canonical: '/campaigns' },
};

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CampaignsListJsonLd />
      {children}
    </>
  );
}
