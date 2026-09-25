'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { useSearchParams } from 'next/navigation';
import type { StorefrontData } from '@/lib/types/store';
import { resolveTemplate, type StorefrontTemplate } from '@/lib/utils/template-resolver';
import { readTemplateContent, mergeTemplateContent } from '@/lib/utils/template-content';

import RestaurantDefaultPage from '@/components/storefront/restaurant-default/RestaurantDefaultPage';
import StreetFoodPopTemplate from '@/components/storefront/street-food/StreetFoodPopTemplate';

// Cuisine
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
import BurgerJointTemplate from '@/components/storefront/cuisine/BurgerJointTemplate';
import SweetShopTemplate from '@/components/storefront/cuisine/SweetShopTemplate';
import RamenNightTemplate from '@/components/storefront/cuisine/RamenNightTemplate';
import MediterraneoTemplate from '@/components/storefront/cuisine/MediterraneoTemplate';
import SmoothieBarTemplate from '@/components/storefront/cuisine/SmoothieBarTemplate';
import KoreanGrilleTemplate from '@/components/storefront/cuisine/KoreanGrilleTemplate';
import FrenchBrasserieTemplate from '@/components/storefront/cuisine/FrenchBrasserieTemplate';

// Retail
import RetailClassicTemplate from '@/components/storefront/retail/RetailClassicTemplate';
import LuxeBoutiqueTemplate from '@/components/storefront/retail/LuxeBoutiqueTemplate';
import CatalogInquiryTemplate from '@/components/storefront/retail/CatalogInquiryTemplate';

// Real estate
import OpenHouseTemplate from '@/components/storefront/real-estate/OpenHouseTemplate';
import SkylineEstateTemplate from '@/components/storefront/real-estate/SkylineEstateTemplate';
import PrestigeEstateTemplate from '@/components/storefront/real-estate/PrestigeEstateTemplate';
import RealEstateAgencyTemplate from '@/components/storefront/real-estate/RealEstateAgencyTemplate';
import RealEstateCorporateTemplate from '@/components/storefront/real-estate/RealEstateCorporateTemplate';
import EclipseEstateTemplate from '@/components/storefront/real-estate/EclipseEstateTemplate';
import ApexRealtyTemplate from '@/components/storefront/real-estate/ApexRealtyTemplate';
import SoleilEstatesTemplate from '@/components/storefront/real-estate/SoleilEstatesTemplate';
import AxiomPropertiesTemplate from '@/components/storefront/real-estate/AxiomPropertiesTemplate';

// Services
import ServicesHubTemplate from '@/components/storefront/services/ServicesHubTemplate';
import SerenitySpaTemplate from '@/components/storefront/services/SerenitySpaTemplate';
import MeridianProTemplate from '@/components/storefront/services/MeridianProTemplate';
import VoltCreativeTemplate from '@/components/storefront/services/VoltCreativeTemplate';
import AuroraWellnessTemplate from '@/components/storefront/services/AuroraWellnessTemplate';
import ObsidianStudioTemplate from '@/components/storefront/services/ObsidianStudioTemplate';

// Medical
import MedClinicTemplate from '@/components/storefront/medical/MedClinicTemplate';
import PharmaTemplate from '@/components/storefront/medical/PharmaTemplate';
import LumiereClinicTemplate from '@/components/storefront/medical/LumiereClinicTemplate';

// Clothing — ClothingStorefront is itself a small router (it needs the resolved template id
// to pick the right of its 3 templates, plus it does its own content-draft merging), so each
// clothing variant gets a one-line wrapper to fit the uniform `{ data }` component shape below.
import { ClothingStorefront } from '@/components/storefront/clothing/ClothingStorefront';

function ClothingEditorial({ data }: { data: StorefrontData }) {
  return <ClothingStorefront data={data} template="clothing-editorial" />;
}
function ClothingStreetwear({ data }: { data: StorefrontData }) {
  return <ClothingStorefront data={data} template="clothing-streetwear" />;
}
function ClothingBoutique({ data }: { data: StorefrontData }) {
  return <ClothingStorefront data={data} template="clothing-boutique" />;
}

interface StorefrontRendererProps {
  data: StorefrontData;
}

// One entry per StorefrontTemplate variant, enforced by the compiler: adding a new id to that
// union without adding it here is a type error, not a silent fallback to the wrong template.
// (Before this registry existed, StorefrontRenderer routed through a hand-maintained switch that
// had drifted behind template-resolver.ts and the onboarding gallery — 27 of 49 template variants,
// including every non-"open house"/"skyline" real-estate template and every non-"hub"/"spa"
// services template, silently rendered RestaurantDefaultPage instead of their real design.)
const TEMPLATE_REGISTRY: Record<StorefrontTemplate, ComponentType<{ data: StorefrontData }>> = {
  'restaurant-default': RestaurantDefaultPage,
  'coffee-artisan': ArtisanTemplate,
  'coffee-urban-rush': UrbanRushTemplate,
  'coffee-cyber-brew': CyberBrewTemplate,
  'coffee-green-leaf': GreenLeafTemplate,
  'coffee-drive-thru': DriveThruTemplate,
  'coffee-cupping-room': CuppingRoomTemplate,
  'coffee-industrial-brew': IndustrialBrewTemplate,
  'coffee-matcha-zen': MatchaZenTemplate,
  'coffee-retro-groove': RetroGrooveTemplate,
  'coffee-blossom': BlossomCafeTemplate,
  'coffee-neon-drip': NeonDripTemplate,
  'coffee-luxury-espresso': LuxuryEspressoTemplate,
  'coffee-aurora-brew': AuroraBrewTemplate,
  'coffee-tropical-bloom': TropicalBloomTemplate,
  'coffee-dark-academia': DarkAcademiaTemplate,
  'street-food-pop': StreetFoodPopTemplate,
  'retail-classic': RetailClassicTemplate,
  'retail-luxe-boutique': LuxeBoutiqueTemplate,
  'catalog-inquiry': CatalogInquiryTemplate,
  'real-estate-default': OpenHouseTemplate,
  'real-estate-open-house': OpenHouseTemplate,
  'real-estate-skyline': SkylineEstateTemplate,
  'real-estate-prestige': PrestigeEstateTemplate,
  'real-estate-agency': RealEstateAgencyTemplate,
  'real-estate-corporate': RealEstateCorporateTemplate,
  'real-estate-noir': EclipseEstateTemplate,
  'real-estate-bold': ApexRealtyTemplate,
  'real-estate-soleil': SoleilEstatesTemplate,
  'real-estate-axiom': AxiomPropertiesTemplate,
  'services-hub': ServicesHubTemplate,
  'services-serenity-spa': SerenitySpaTemplate,
  'services-meridian': MeridianProTemplate,
  'services-volt': VoltCreativeTemplate,
  'services-wellness': AuroraWellnessTemplate,
  'services-studio': ObsidianStudioTemplate,
  'medical-clinic': MedClinicTemplate,
  'medical-pharmacy': PharmaTemplate,
  'medical-premium': LumiereClinicTemplate,
  'burger-restaurant': BurgerJointTemplate,
  'dessert-shop': SweetShopTemplate,
  'ramen-shop': RamenNightTemplate,
  'mediterranean-restaurant': MediterraneoTemplate,
  'smoothie-bar': SmoothieBarTemplate,
  'korean-grille': KoreanGrilleTemplate,
  'french-brasserie': FrenchBrasserieTemplate,
  'clothing-editorial': ClothingEditorial,
  'clothing-streetwear': ClothingStreetwear,
  'clothing-boutique': ClothingBoutique,
};

export function StorefrontRenderer({ data }: StorefrontRendererProps) {
  const template = resolveTemplate(data.store);
  const isPreview = useSearchParams().get('preview') === '1';

  // Real storefront: backend-published content, fetched server-side into `data` (see
  // fetchStorefront in lib/api/storefront-api.ts) — no localStorage involved, so this works on a
  // fresh browser with nothing cached locally. Preview mode (dashboard editor iframe) instead
  // overlays the merchant's in-progress, unpublished edits via the same-tab draft bridge.
  const [templateContent, setTemplateContent] = useState(() =>
    isPreview ? readTemplateContent(data.store.slug, template) : mergeTemplateContent(template, data.templateContent),
  );

  useEffect(() => {
    if (!isPreview) return;
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
  }, [data.store.slug, template, isPreview]);

  // Templates show `templateContent.openingHours || store.openingHours`. On a real store the hours
  // must be the live M1-03 status (store.openingHours: "Open now · closes at…", "Closed", "Hours not
  // available"), never preset/free-text hours that can contradict it — so drop the text override.
  const enriched: StorefrontData = {
    ...data,
    templateContent: data.demo || !templateContent ? templateContent : { ...templateContent, openingHours: undefined },
  };

  const Template = TEMPLATE_REGISTRY[template];
  // display: contents keeps the wrapper out of layout; the attribute lets smoke tests confirm
  // which registry entry actually rendered.
  return (
    <div data-storefront-template={template} style={{ display: 'contents' }}>
      <Template data={enriched} />
    </div>
  );
}
