import type { StorefrontData, PublicStore, PublicProduct, StoreBusinessType } from '../types/store';
import { DEMO_RESTAURANT } from '../data/mock-store';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

interface ApiStoreRaw {
  id: string;
  ownerId?: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  primaryColor?: string;
  categorySlug?: string;
  subCategorySlug?: string;
  templateKey?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiProductRaw {
  id: string;
  nameEn: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  available: boolean;
}

// The backend has no stock/quantity model (only the `available` flag), but every storefront
// template's "Add to bag" gate checks `available && stock > 0` — map available to a stock value
// that satisfies that gate rather than adding a stock concept the backend doesn't have.
function mapProduct(raw: ApiProductRaw): PublicProduct {
  return {
    id: raw.id as unknown as number, // real id is a UUID string — see PublicProduct's id comment
    name: raw.nameEn,
    description: raw.description ?? '',
    category: '',
    price: raw.price,
    discountPrice: raw.salePrice ?? null,
    stock: raw.available ? 1 : 0,
    available: raw.available,
    imageUrl: raw.imageUrl ?? null,
  };
}

function deriveBizType(templateKey: string | undefined, categorySlug: string | undefined): StoreBusinessType {
  const key = (templateKey ?? categorySlug ?? '').toLowerCase();
  if (key.startsWith('clothing')) return 'clothing';
  if (key.startsWith('real-estate') || key.startsWith('real_estate')) return 'real_estate';
  if (key.startsWith('retail')) return 'retail';
  if (key.startsWith('catalog')) return 'catalog';
  if (key.startsWith('medical')) return 'medical';
  if (key.startsWith('services') || key.startsWith('service')) return 'services';
  // restaurant patterns: coffee-, street-food-, burger-, dessert-, ramen-, etc.
  if (
    key.startsWith('coffee') ||
    key.startsWith('street-food') ||
    key.startsWith('burger') ||
    key.startsWith('dessert') ||
    key.startsWith('ramen') ||
    key.startsWith('mediterranean') ||
    key.startsWith('smoothie') ||
    key.startsWith('korean') ||
    key.startsWith('french') ||
    key.startsWith('restaurant') ||
    key.startsWith('food')
  ) return 'restaurant';
  return 'restaurant';
}

function mapStore(raw: ApiStoreRaw): PublicStore {
  const templateKey = raw.templateKey ?? raw.subCategorySlug ?? null;
  return {
    id: raw.id as unknown as number,
    slug: raw.slug,
    shopName: raw.name,
    description: raw.description ?? '',
    businessType: deriveBizType(raw.templateKey, raw.categorySlug),
    businessSubCategorySlug: templateKey,
    mainBusinessCategoryLabel: raw.categorySlug ?? '',
    primaryColor: raw.primaryColor ?? null,
    logoUrl: raw.logoUrl ?? raw.coverImageUrl ?? null,
    whatsappNumber: raw.whatsappNumber ?? null,
    openingHours: '',
    deliveryInfo: null,
    currencyCode: 'MYR',
    currencySuffix: '',
  };
}

export async function fetchStorefront(slug: string): Promise<StorefrontData | null> {
  if (!API_BASE || slug === 'demo-restaurant') {
    return { ...DEMO_RESTAURANT, store: { ...DEMO_RESTAURANT.store, slug } };
  }

  try {
    const [storeRes, prodsRes] = await Promise.all([
      fetch(`${API_BASE}/api/public/stores/${slug}`, { next: { revalidate: 60 } }),
      fetch(`${API_BASE}/api/public/stores/${slug}/products`, { next: { revalidate: 60 } }).catch(() => null),
    ]);

    if (storeRes.status === 404) return null;
    if (!storeRes.ok) throw new Error(`Store API ${storeRes.status}`);

    const storeBody = await storeRes.json();
    const raw: ApiStoreRaw = storeBody.data ?? storeBody;
    const store = mapStore(raw);

    let products: PublicProduct[] = [];
    if (prodsRes?.ok) {
      const prodsBody = await prodsRes.json();
      const rawProds: ApiProductRaw[] = prodsBody.data ?? prodsBody;
      products = Array.isArray(rawProds) ? rawProds.map(mapProduct) : [];
    }

    return { store, products };
  } catch {
    return { ...DEMO_RESTAURANT, store: { ...DEMO_RESTAURANT.store, slug } };
  }
}
