import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMockStore } from '@/lib/data/mock-stores';
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
import RetroGrooveTemplate from '@/components/storefront/cuisine/RetroGrooveTemplate';
import BlossomCafeTemplate from '@/components/storefront/cuisine/BlossomCafeTemplate';
import NeonDripTemplate from '@/components/storefront/cuisine/NeonDripTemplate';
import LuxuryEspressoTemplate from '@/components/storefront/cuisine/LuxuryEspressoTemplate';
import AuroraBrewTemplate from '@/components/storefront/cuisine/AuroraBrewTemplate';
import TropicalBloomTemplate from '@/components/storefront/cuisine/TropicalBloomTemplate';
import DarkAcademiaTemplate from '@/components/storefront/cuisine/DarkAcademiaTemplate';
import StreetFoodPopTemplate from '@/components/storefront/street-food/StreetFoodPopTemplate';
import BurgerJointTemplate from '@/components/storefront/cuisine/BurgerJointTemplate';
import SweetShopTemplate from '@/components/storefront/cuisine/SweetShopTemplate';
import RamenNightTemplate from '@/components/storefront/cuisine/RamenNightTemplate';
import MediterraneoTemplate from '@/components/storefront/cuisine/MediterraneoTemplate';
import SmoothieBarTemplate from '@/components/storefront/cuisine/SmoothieBarTemplate';
import KoreanGrilleTemplate from '@/components/storefront/cuisine/KoreanGrilleTemplate';
import FrenchBrasserieTemplate from '@/components/storefront/cuisine/FrenchBrasserieTemplate';
import PrestigeEstateTemplate from '@/components/storefront/real-estate/PrestigeEstateTemplate';
import RealEstateAgencyTemplate from '@/components/storefront/real-estate/RealEstateAgencyTemplate';
import RealEstateCorporateTemplate from '@/components/storefront/real-estate/RealEstateCorporateTemplate';
import EclipseEstateTemplate from '@/components/storefront/real-estate/EclipseEstateTemplate';
import ApexRealtyTemplate from '@/components/storefront/real-estate/ApexRealtyTemplate';
import SoleilEstatesTemplate from '@/components/storefront/real-estate/SoleilEstatesTemplate';
import AxiomPropertiesTemplate from '@/components/storefront/real-estate/AxiomPropertiesTemplate';
import MeridianProTemplate from '@/components/storefront/services/MeridianProTemplate';
import VoltCreativeTemplate from '@/components/storefront/services/VoltCreativeTemplate';
import AuroraWellnessTemplate from '@/components/storefront/services/AuroraWellnessTemplate';
import ObsidianStudioTemplate from '@/components/storefront/services/ObsidianStudioTemplate';
import MedClinicTemplate from '@/components/storefront/medical/MedClinicTemplate';
import PharmaTemplate from '@/components/storefront/medical/PharmaTemplate';
import LumiereClinicTemplate from '@/components/storefront/medical/LumiereClinicTemplate';
import FashionEditorialTemplate from '@/components/storefront/clothing/FashionEditorialTemplate';
import VoidDripTemplate from '@/components/storefront/clothing/VoidDripTemplate';
import PetalStudioTemplate from '@/components/storefront/clothing/PetalStudioTemplate';
import RetailClassicTemplate from '@/components/storefront/retail/RetailClassicTemplate';
import LuxeBoutiqueTemplate from '@/components/storefront/retail/LuxeBoutiqueTemplate';
import CatalogInquiryTemplate from '@/components/storefront/retail/CatalogInquiryTemplate';
import OpenHouseTemplate from '@/components/storefront/real-estate/OpenHouseTemplate';
import SkylineEstateTemplate from '@/components/storefront/real-estate/SkylineEstateTemplate';
import ServicesHubTemplate from '@/components/storefront/services/ServicesHubTemplate';
import SerenitySpaTemplate from '@/components/storefront/services/SerenitySpaTemplate';

const VALID_IDS = new Set([
  'restaurant-default', 'cafe', 'coffee-artisan', 'coffee-urban-rush',
  'coffee-cyber-brew', 'coffee-green-leaf', 'coffee-drive-thru', 'coffee-cupping-room',
  'coffee-industrial-brew', 'coffee-matcha-zen', 'coffee-retro-groove', 'coffee-blossom',
  'coffee-neon-drip', 'coffee-luxury-espresso', 'coffee-aurora-brew',
  'coffee-tropical-bloom', 'coffee-dark-academia', 'street-food-pop',
  'burger-restaurant', 'pizza-restaurant', 'chinese-restaurant', 'dessert-shop',
  'ramen-shop', 'mediterranean-restaurant', 'smoothie-bar', 'korean-grille', 'french-brasserie',
  'real-estate-prestige',
  'real-estate-agency',
  'real-estate-corporate',
  'real-estate-noir',
  'real-estate-bold',
  'real-estate-soleil',
  'real-estate-axiom',
  'services-meridian',
  'services-volt',
  'services-wellness',
  'services-studio',
  'medical-clinic',
  'medical-pharmacy',
  'medical-premium',
  'clothing-editorial',
  'clothing-streetwear',
  'clothing-boutique',
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
  return {
    title: `Template Preview: ${id} — ShopLink`,
  };
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { id } = await params;

  if (!VALID_IDS.has(id)) notFound();

  const data = getMockStore(id);
  const template = resolveTemplate(data.store);

  switch (template) {
    case 'coffee-artisan':        return <ArtisanTemplate data={data} />;
    case 'coffee-urban-rush':     return <UrbanRushTemplate data={data} />;
    case 'coffee-cyber-brew':     return <CyberBrewTemplate data={data} />;
    case 'coffee-green-leaf':     return <GreenLeafTemplate data={data} />;
    case 'coffee-drive-thru':     return <DriveThruTemplate data={data} />;
    case 'coffee-cupping-room':   return <CuppingRoomTemplate data={data} />;
    case 'coffee-industrial-brew': return <IndustrialBrewTemplate data={data} />;
    case 'coffee-matcha-zen':     return <MatchaZenTemplate data={data} />;
    case 'coffee-retro-groove':  return <RetroGrooveTemplate data={data} />;
    case 'coffee-blossom':       return <BlossomCafeTemplate data={data} />;
    case 'coffee-neon-drip':         return <NeonDripTemplate data={data} />;
    case 'coffee-luxury-espresso':   return <LuxuryEspressoTemplate data={data} />;
    case 'coffee-aurora-brew':       return <AuroraBrewTemplate data={data} />;
    case 'coffee-tropical-bloom':    return <TropicalBloomTemplate data={data} />;
    case 'coffee-dark-academia':     return <DarkAcademiaTemplate data={data} />;
    case 'street-food-pop':       return <StreetFoodPopTemplate data={data} />;
    case 'burger-restaurant':          return <BurgerJointTemplate data={data} />;
    case 'dessert-shop':               return <SweetShopTemplate data={data} />;
    case 'ramen-shop':                 return <RamenNightTemplate data={data} />;
    case 'mediterranean-restaurant':   return <MediterraneoTemplate data={data} />;
    case 'smoothie-bar':               return <SmoothieBarTemplate data={data} />;
    case 'korean-grille':              return <KoreanGrilleTemplate data={data} />;
    case 'french-brasserie':           return <FrenchBrasserieTemplate data={data} />;
    case 'real-estate-prestige':       return <PrestigeEstateTemplate data={data} />;
    case 'real-estate-agency':         return <RealEstateAgencyTemplate data={data} />;
    case 'real-estate-corporate':      return <RealEstateCorporateTemplate data={data} />;
    case 'real-estate-noir':           return <EclipseEstateTemplate data={data} />;
    case 'real-estate-bold':           return <ApexRealtyTemplate data={data} />;
    case 'real-estate-soleil':         return <SoleilEstatesTemplate data={data} />;
    case 'real-estate-axiom':          return <AxiomPropertiesTemplate data={data} />;
    case 'services-meridian':          return <MeridianProTemplate data={data} />;
    case 'services-volt':              return <VoltCreativeTemplate data={data} />;
    case 'services-wellness':          return <AuroraWellnessTemplate data={data} />;
    case 'services-studio':            return <ObsidianStudioTemplate data={data} />;
    case 'medical-clinic':             return <MedClinicTemplate data={data} />;
    case 'medical-pharmacy':           return <PharmaTemplate data={data} />;
    case 'medical-premium':            return <LumiereClinicTemplate data={data} />;
    case 'clothing-editorial':         return <FashionEditorialTemplate data={data} />;
    case 'clothing-streetwear':        return <VoidDripTemplate data={data} />;
    case 'clothing-boutique':          return <PetalStudioTemplate data={data} />;
    case 'retail-classic':        return <RetailClassicTemplate data={data} />;
    case 'retail-luxe-boutique':  return <LuxeBoutiqueTemplate data={data} />;
    case 'catalog-inquiry':       return <CatalogInquiryTemplate data={data} />;
    case 'real-estate-default':
    case 'real-estate-open-house': return <OpenHouseTemplate data={data} />;
    case 'real-estate-skyline':   return <SkylineEstateTemplate data={data} />;
    case 'services-hub':          return <ServicesHubTemplate data={data} />;
    case 'services-serenity-spa': return <SerenitySpaTemplate data={data} />;
    default:                      return <RestaurantDefaultPage data={data} />;
  }
}
