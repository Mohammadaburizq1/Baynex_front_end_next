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
  /** ISO 4217 code, same as currencyCode (kept for the templates' existing prop plumbing). */
  currencySuffix: string;
  timezone?: string;
  locale?: string;
  businessHours?: PublicBusinessHours;
  acceptingOrders?: boolean;
}

export type BusinessHoursStatus = 'OPEN' | 'CLOSED' | 'NOT_CONFIGURED';

export interface PublicBusinessHoursDay {
  dayOfWeek: string;
  closed: boolean;
  open24Hours: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface PublicBusinessHours {
  status: BusinessHoursStatus;
  configured: boolean;
  timezone: string;
  currentDay: string;
  closesAt: string | null;
  opensAt: string | null;
  days: PublicBusinessHoursDay[];
  acceptingOrders: boolean;
  canAcceptOrders: boolean;
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
  // ── Catalogue detail (absent on mock/demo products) ──────────────────────────
  slug?: string;
  /** False when it can't be bought right now (sold out / every variant sold out). */
  inStock?: boolean;
  hasVariants?: boolean;
  /** Option axes (Size, Color) and their values. */
  options?: PublicOption[];
  /** The purchasable combinations; required to order when hasVariants. */
  variants?: PublicVariant[];
  /** Add-on groups (Extras) the customer can pick from. */
  addonGroups?: PublicAddonGroup[];
  /** Gallery pictures, primary first. */
  images?: string[];
}

export interface PublicOption { id: string; name: string; values: { id: string; label: string }[] }

export interface PublicVariant {
  id: string;
  /** "M / Black" */
  label: string;
  /** One label per option, in option order. */
  selection: string[];
  price: number;
  discountPrice: number | null;
  inStock: boolean;
  available: boolean;
}

export interface PublicAddonOption { id: string; name: string; priceDelta: number; preselected: boolean; available: boolean }

export interface PublicAddonGroup {
  id: string;
  name: string;
  /** 0 = optional, >= 1 = required. */
  minSelect: number;
  maxSelect: number;
  options: PublicAddonOption[];
}

export interface StorefrontData {
  store: PublicStore;
  products: PublicProduct[];
  /** Editable copy/media injected by StorefrontRenderer from localStorage. */
  templateContent?: import('./template-content').TemplateContent;
  /**
   * True only for the /templates/[id] showcase (mock store). Illustrative people, reviews, client
   * lists, statistics and sample items render only then — never on a real store's storefront.
   */
  demo?: boolean;
}
