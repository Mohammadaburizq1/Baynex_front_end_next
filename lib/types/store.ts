export type StoreBusinessType =
  | 'restaurant'
  | 'retail'
  | 'real_estate'
  | 'services'
  | 'catalog'
  | 'medical'
  | 'clothing';

export interface PublicStore {
  id: number;
  slug: string;
  shopName: string;
  description: string;
  businessType: StoreBusinessType;
  businessSubCategorySlug: string | null;
  mainBusinessCategoryLabel: string;
  primaryColor: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  openingHours: string;
  deliveryInfo: string | null;
  currencyCode: string;
  currencySuffix: string;
}

export interface PublicProduct {
  /**
   * Typed number for historical reasons, but the real backend actually returns
   * UUID strings here — every consumer of this field across the ~30 storefront
   * templates treats it as an opaque number key sourced from mock data. When
   * building a real API payload (see lib/api/checkout.ts), cast with String(id).
   */
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  available: boolean;
  imageUrl: string | null;
}

export interface StorefrontData {
  store: PublicStore;
  products: PublicProduct[];
  /** Editable copy/media injected by StorefrontRenderer from localStorage. */
  templateContent?: import('./template-content').TemplateContent;
}
