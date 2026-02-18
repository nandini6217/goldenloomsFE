import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type CampaignFromApi = {
  slug: string;
  name: string;
  description?: string;
  bannerImage?: string;
};

async function getCampaigns(): Promise<CampaignFromApi[]> {
  try {
    const res = await fetch(`${apiUrl}/api/campaigns`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="container-custom py-10">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Campaigns' },
        ]}
        className="mb-6"
      />
      <h1 className="font-display text-3xl font-semibold text-primary mb-8">Campaigns</h1>
      <p className="text-primary/80 mb-10 max-w-2xl">
        Explore our current campaigns and special offers on resin jewelry and handloom collections.
      </p>
      {campaigns.length === 0 ? (
        <p className="text-primary/70 py-12">No active campaigns at the moment. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Link key={c.slug} href={`/campaigns/${c.slug}`} className="group block">
              <Card className="overflow-hidden transition-all duration-300 hover:shadow-soft-hover group-hover:scale-[1.02] h-full">
                <div className="aspect-[4/3] bg-primary/10 flex items-center justify-center overflow-hidden relative">
                  {c.bannerImage ? (
                    <Image
                      src={c.bannerImage}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-primary/40 font-display text-xl px-2">{c.name}</span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h2 className="font-display font-semibold text-primary">{c.name}</h2>
                  {c.description && (
                    <p className="text-sm text-primary/70 mt-1 line-clamp-2">{c.description}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
