import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMockStore } from '@/lib/data/mock-stores';
import { StorefrontRenderer } from '@/components/storefront/StorefrontRenderer';
import { Suspense } from 'react';

const VALID_IDS = new Set([
  'restaurant-default', 'cafe', 'coffee-artisan', 'coffee-urban-rush',
  'coffee-cyber-brew', 'coffee-green-leaf', 'coffee-drive-thru', 'coffee-cupping-room',
  'coffee-industrial-brew', 'coffee-matcha-zen', 'coffee-retro-groove', 'coffee-blossom',
  'coffee-neon-drip', 'coffee-luxury-espresso', 'coffee-aurora-brew',
  'coffee-tropical-bloom', 'coffee-dark-academia', 'street-food-pop',
  'burger-restaurant', 'pizza-restaurant', 'chinese-restaurant', 'dessert-shop',
  'ramen-shop', 'mediterranean-restaurant', 'smoothie-bar', 'korean-grille', 'french-brasserie',
  'real-estate-prestige', 'real-estate-agency', 'real-estate-corporate',
  'real-estate-noir', 'real-estate-bold', 'real-estate-soleil', 'real-estate-axiom',
  'services-meridian', 'services-volt', 'services-wellness', 'services-studio',
  'medical-clinic', 'medical-pharmacy', 'medical-premium',
  'clothing-editorial', 'clothing-streetwear', 'clothing-boutique',
  'fast-food', 'healthy-food', 'seafood-restaurant', 'breakfast-restaurant',
  'retail-classic', 'retail-luxe-boutique', 'catalog-inquiry',
  'real-estate-default', 'real-estate-open-house', 'real-estate-skyline',
  'services-hub', 'services-serenity-spa',
]);

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Template Preview: ${id} — ShopLink` };
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { id } = await params;
  if (!VALID_IDS.has(id)) notFound();

  const data = getMockStore(id);

  return (
    <Suspense fallback={null}>
      <StorefrontRenderer data={data} />
    </Suspense>
  );
}
