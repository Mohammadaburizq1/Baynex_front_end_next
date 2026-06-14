import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchStorefront } from '@/lib/api/storefront-api';
import { resolveTemplate } from '@/lib/utils/template-resolver';
import RestaurantDefaultPage from '@/components/storefront/restaurant-default/RestaurantDefaultPage';
import ArtisanTemplate from '@/components/storefront/cuisine/ArtisanTemplate';
import UrbanRushTemplate from '@/components/storefront/cuisine/UrbanRushTemplate';
import CyberBrewTemplate from '@/components/storefront/cuisine/CyberBrewTemplate';
import GreenLeafTemplate from '@/components/storefront/cuisine/GreenLeafTemplate';
import DriveThruTemplate from '@/components/storefront/cuisine/DriveThruTemplate';
import CuppingRoomTemplate from '@/components/storefront/cuisine/CuppingRoomTemplate';
import IndustrialBrewTemplate from '@/components/storefront/cuisine/IndustrialBrewTemplate';
import MatchaZenTemplate from '@/components/storefront/cuisine/MatchaZenTemplate';
import StreetFoodPopTemplate from '@/components/storefront/street-food/StreetFoodPopTemplate';
import RetailClassicTemplate from '@/components/storefront/retail/RetailClassicTemplate';
import LuxeBoutiqueTemplate from '@/components/storefront/retail/LuxeBoutiqueTemplate';
import CatalogInquiryTemplate from '@/components/storefront/retail/CatalogInquiryTemplate';
import OpenHouseTemplate from '@/components/storefront/real-estate/OpenHouseTemplate';
import SkylineEstateTemplate from '@/components/storefront/real-estate/SkylineEstateTemplate';
import ServicesHubTemplate from '@/components/storefront/services/ServicesHubTemplate';
import SerenitySpaTemplate from '@/components/storefront/services/SerenitySpaTemplate';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchStorefront(slug);
  if (!data) return { title: 'Store Not Found — ShopLink' };
  return {
    title: `${data.store.shopName} — ShopLink`,
    description: data.store.description || `Visit ${data.store.shopName} on ShopLink.`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchStorefront(slug);

  if (!data) notFound();

  const template = resolveTemplate(data.store);

  switch (template) {
    case 'coffee-artisan':         return <ArtisanTemplate data={data} />;
    case 'coffee-urban-rush':      return <UrbanRushTemplate data={data} />;
    case 'coffee-cyber-brew':      return <CyberBrewTemplate data={data} />;
    case 'coffee-green-leaf':      return <GreenLeafTemplate data={data} />;
    case 'coffee-drive-thru':      return <DriveThruTemplate data={data} />;
    case 'coffee-cupping-room':    return <CuppingRoomTemplate data={data} />;
    case 'coffee-industrial-brew': return <IndustrialBrewTemplate data={data} />;
    case 'coffee-matcha-zen':      return <MatchaZenTemplate data={data} />;
    case 'street-food-pop':        return <StreetFoodPopTemplate data={data} />;
    case 'retail-classic':         return <RetailClassicTemplate data={data} />;
    case 'retail-luxe-boutique':   return <LuxeBoutiqueTemplate data={data} />;
    case 'catalog-inquiry':        return <CatalogInquiryTemplate data={data} />;
    case 'real-estate-default':
    case 'real-estate-open-house': return <OpenHouseTemplate data={data} />;
    case 'real-estate-skyline':    return <SkylineEstateTemplate data={data} />;
    case 'services-hub':           return <ServicesHubTemplate data={data} />;
    case 'services-serenity-spa':  return <SerenitySpaTemplate data={data} />;
    default:                       return <RestaurantDefaultPage data={data} />;
  }
}
