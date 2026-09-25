import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchStorefront } from '@/lib/api/storefront-api';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchStorefront(slug);
  if (!data) notFound();

  return {
    title: `${data.store.shopName} - khanGates`,
    description: data.store.description || `Visit ${data.store.shopName} on khanGates.`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchStorefront(slug);

  if (!data) notFound();

  return <StorefrontRenderer data={data} />;
}
