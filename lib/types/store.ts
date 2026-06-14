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
}
