import type { PublicStore } from '../types/store';

export type StorefrontTemplate =
  | 'restaurant-default'
  | 'coffee-artisan'
  | 'coffee-urban-rush'
  | 'coffee-cyber-brew'
  | 'coffee-green-leaf'
  | 'coffee-drive-thru'
  | 'coffee-cupping-room'
  | 'coffee-industrial-brew'
  | 'coffee-matcha-zen'
  | 'coffee-retro-groove'
  | 'coffee-blossom'
  | 'coffee-neon-drip'
  | 'coffee-luxury-espresso'
  | 'coffee-aurora-brew'
  | 'coffee-tropical-bloom'
  | 'coffee-dark-academia'
  | 'street-food-pop'
  | 'retail-classic'
  | 'retail-luxe-boutique'
  | 'catalog-inquiry'
  | 'real-estate-default'
  | 'real-estate-open-house'
  | 'real-estate-skyline'
  | 'services-hub'
  | 'services-serenity-spa'
  | 'burger-restaurant'
  | 'dessert-shop'
  | 'ramen-shop'
  | 'mediterranean-restaurant'
  | 'smoothie-bar'
  | 'korean-grille'
  | 'french-brasserie'
  | 'real-estate-prestige'
  | 'real-estate-agency'
  | 'real-estate-corporate'
  | 'real-estate-noir'
  | 'real-estate-bold'
  | 'real-estate-soleil'
  | 'real-estate-axiom'
  | 'services-meridian'
  | 'services-volt'
  | 'services-wellness'
  | 'services-studio'
  | 'medical-clinic'
  | 'medical-pharmacy'
  | 'medical-premium'
  | 'clothing-editorial'
  | 'clothing-streetwear'
  | 'clothing-boutique';

export function normalizeSlug(raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase().replace(/_/g, '-');
}

export function resolveTemplate(store: PublicStore): StorefrontTemplate {
  const { businessType, businessSubCategorySlug } = store;
  const sub = normalizeSlug(businessSubCategorySlug);

  if (businessType === 'restaurant') {
    switch (sub) {
      case 'coffee-artisan':       return 'coffee-artisan';
      case 'coffee-urban-rush':    return 'coffee-urban-rush';
      case 'coffee-cyber-brew':    return 'coffee-cyber-brew';
      case 'coffee-green-leaf':    return 'coffee-green-leaf';
      case 'coffee-drive-thru':    return 'coffee-drive-thru';
      case 'coffee-cupping-room':  return 'coffee-cupping-room';
      case 'coffee-industrial-brew': return 'coffee-industrial-brew';
      case 'coffee-matcha-zen':    return 'coffee-matcha-zen';
      case 'coffee-retro-groove':  return 'coffee-retro-groove';
      case 'coffee-blossom':       return 'coffee-blossom';
      case 'coffee-neon-drip':         return 'coffee-neon-drip';
      case 'coffee-luxury-espresso':   return 'coffee-luxury-espresso';
      case 'coffee-aurora-brew':       return 'coffee-aurora-brew';
      case 'coffee-tropical-bloom':    return 'coffee-tropical-bloom';
      case 'coffee-dark-academia':     return 'coffee-dark-academia';
      case 'street-food-pop':      return 'street-food-pop';
      case 'burger-restaurant':          return 'burger-restaurant';
      case 'dessert-shop':               return 'dessert-shop';
      case 'ramen-shop':                 return 'ramen-shop';
      case 'mediterranean-restaurant':   return 'mediterranean-restaurant';
      case 'smoothie-bar':               return 'smoothie-bar';
      case 'korean-grille':              return 'korean-grille';
      case 'french-brasserie':           return 'french-brasserie';
      default:                           return 'restaurant-default';
    }
  }

  if (businessType === 'retail') {
    if (sub === 'retail-luxe-boutique') return 'retail-luxe-boutique';
    return 'retail-classic';
  }

  if (businessType === 'real_estate') {
    if (sub === 'real-estate-open-house')     return 'real-estate-open-house';
    if (sub === 'real-estate-skyline-estate') return 'real-estate-skyline';
    if (sub === 'real-estate-prestige')       return 'real-estate-prestige';
    if (sub === 'real-estate-agency')         return 'real-estate-agency';
    if (sub === 'real-estate-corporate')      return 'real-estate-corporate';
    if (sub === 'real-estate-noir')           return 'real-estate-noir';
    if (sub === 'real-estate-bold')           return 'real-estate-bold';
    if (sub === 'real-estate-soleil')         return 'real-estate-soleil';
    if (sub === 'real-estate-axiom')          return 'real-estate-axiom';
    return 'real-estate-default';
  }

  if (businessType === 'services') {
    if (sub === 'services-serenity-spa') return 'services-serenity-spa';
    if (sub === 'services-meridian')     return 'services-meridian';
    if (sub === 'services-volt')         return 'services-volt';
    if (sub === 'services-wellness')     return 'services-wellness';
    if (sub === 'services-studio')       return 'services-studio';
    return 'services-hub';
  }

  if (businessType === 'medical') {
    if (sub === 'medical-pharmacy') return 'medical-pharmacy';
    if (sub === 'medical-premium')  return 'medical-premium';
    return 'medical-clinic';
  }

  if (businessType === 'clothing') {
    if (sub === 'clothing-streetwear') return 'clothing-streetwear';
    if (sub === 'clothing-boutique')   return 'clothing-boutique';
    return 'clothing-editorial';
  }

  if (businessType === 'catalog') return 'catalog-inquiry';

  return 'restaurant-default';
}
