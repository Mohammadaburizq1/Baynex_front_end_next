import type { Metadata } from 'next';
import { fetchStorefront } from '@/lib/api/storefront-api';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import { LocalStorefrontLoader } from '@/components/storefront/LocalStorefrontLoader';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchStorefront(slug);
  if (!data) {
    return {
      title: `${slug} — ShopLink`,
      description: 'Visit this store on ShopLink.',
    };
  }
  return {
    title: `${data.store.shopName} — ShopLink`,
    description: data.store.description || `Visit ${data.store.shopName} on ShopLink.`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchStorefront(slug);

  if (data) {
    return <StorefrontRenderer data={data} />;
  }

  return <LocalStorefrontLoader slug={slug} />;
}
