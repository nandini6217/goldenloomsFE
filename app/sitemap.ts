import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://goldenlooms.com';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function getProducts(): Promise<{ _id: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${apiUrl}/api/products`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getCampaigns(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const res = await fetch(`${apiUrl}/api/campaigns`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, campaigns] = await Promise.all([getProducts(), getCampaigns()]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/campaigns`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/products/${p._id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const campaignEntries: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${baseUrl}/campaigns/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...productEntries, ...campaignEntries];
}
