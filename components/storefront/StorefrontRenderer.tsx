'use client';

import { useEffect, useState } from 'react';
import type { StorefrontData } from '@/lib/types/store';
import { resolveTemplate } from '@/lib/utils/template-resolver';
import { readTemplateContent } from '@/lib/utils/template-content';
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
import { ClothingStorefront } from '@/components/storefront/clothing/ClothingStorefront';

interface StorefrontRendererProps {
  data: StorefrontData;
}

export function StorefrontRenderer({ data }: StorefrontRendererProps) {
  const template = resolveTemplate(data.store);

  const [templateContent, setTemplateContent] = useState(() =>
    readTemplateContent(data.store.slug, template),
  );

  useEffect(() => {
    function reload() {
      setTemplateContent(readTemplateContent(data.store.slug, template));
    }
    // storage fires in iframes when parent window changes localStorage
    window.addEventListener('storage', reload);
    // same-window event dispatched by the dashboard editor
    window.addEventListener('shoplink:template-draft', reload);
    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener('shoplink:template-draft', reload);
    };
  }, [data.store.slug, template]);

  const enriched: StorefrontData = { ...data, templateContent };

  switch (template) {
    case 'coffee-artisan':         return <ArtisanTemplate data={enriched} />;
    case 'coffee-urban-rush':      return <UrbanRushTemplate data={enriched} />;
    case 'coffee-cyber-brew':      return <CyberBrewTemplate data={enriched} />;
    case 'coffee-green-leaf':      return <GreenLeafTemplate data={enriched} />;
    case 'coffee-drive-thru':      return <DriveThruTemplate data={enriched} />;
    case 'coffee-cupping-room':    return <CuppingRoomTemplate data={enriched} />;
    case 'coffee-industrial-brew': return <IndustrialBrewTemplate data={enriched} />;
    case 'coffee-matcha-zen':      return <MatchaZenTemplate data={enriched} />;
    case 'street-food-pop':        return <StreetFoodPopTemplate data={enriched} />;
    case 'retail-classic':         return <RetailClassicTemplate data={enriched} />;
    case 'retail-luxe-boutique':   return <LuxeBoutiqueTemplate data={enriched} />;
    case 'catalog-inquiry':        return <CatalogInquiryTemplate data={enriched} />;
    case 'real-estate-default':
    case 'real-estate-open-house': return <OpenHouseTemplate data={enriched} />;
    case 'real-estate-skyline':    return <SkylineEstateTemplate data={enriched} />;
    case 'services-hub':           return <ServicesHubTemplate data={enriched} />;
    case 'services-serenity-spa':  return <SerenitySpaTemplate data={enriched} />;
    case 'clothing-editorial':
    case 'clothing-streetwear':
    case 'clothing-boutique':      return <ClothingStorefront data={enriched} template={template} />;
    default:                       return <RestaurantDefaultPage data={enriched} />;
  }
}
