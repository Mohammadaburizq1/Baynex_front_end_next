import type { StorefrontData, PublicStore, PublicProduct, StoreBusinessType, PublicBusinessHours } from '../types/store';
import type { TemplateContent } from '../types/template-content';

export class StorefrontConfigurationError extends Error {
  readonly kind = 'CONFIGURATION_FAILURE' as const;

  constructor() {
    super('Storefront service is not configured.');
    this.name = 'StorefrontConfigurationError';
  }
}

export class StorefrontApiError extends Error {
  readonly kind = 'API_FAILURE' as const;
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'StorefrontApiError';
    this.status = status;
  }
}

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
  currency?: string;
  timezone?: string;
  locale?: string;
  acceptingOrders?: boolean;
  businessHours?: PublicBusinessHours;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiProductRaw {
  id: string;
  slug?: string;
  nameEn: string;
  description?: string;
  categoryId?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  available: boolean;
  inStock?: boolean;
  hasVariants?: boolean;
  options?: { id: string; name: string; values: { id: string; label: string }[] }[];
  variants?: {
    id: string;
    label: string;
    selection: string[];
    price: number;
    salePrice?: number | null;
    inStock: boolean;
    available: boolean;
  }[];
  modifierGroups?: {
    id: string;
    name: string;
    minSelect: number;
    maxSelect: number;
    options: { id: string; name: string; priceDelta: number; preselected: boolean; available: boolean }[];
  }[];
  images?: { id: string; url: string }[];
}

interface ApiCategoryRaw {
  id: string;
  nameEn: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getApiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!base) throw new StorefrontConfigurationError();
  return base.replace(/\/$/, '');
}

async function readApiData<T>(response: Response, endpoint: string): Promise<T> {
  if (!response.ok) {
    throw new StorefrontApiError(`Storefront request failed (${response.status}).`, response.status);
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new StorefrontApiError(`Storefront response from ${endpoint} was not valid JSON.`);
  }

  if (!isRecord(body) || body.success === false) {
    throw new StorefrontApiError(`Storefront response from ${endpoint} was malformed.`);
  }

  // The backend serializes with default-property-inclusion: non_null, so a null payload (e.g. a
  // store that has never published theme content) arrives with no `data` key at all. Every caller
  // validates the shape it needs, so a required payload that is missing still fails there.
  return ('data' in body ? body.data : null) as T;
}

function mapProduct(raw: ApiProductRaw, categoryNames: Map<string, string>): PublicProduct {
  return {
    id: raw.id as unknown as number,
    name: raw.nameEn,
    description: raw.description ?? '',
    category: (raw.categoryId && categoryNames.get(raw.categoryId)) || '',
    price: raw.price,
    discountPrice: raw.salePrice ?? null,
    stock: raw.available && (raw.inStock ?? true) ? 1 : 0,
    available: raw.available,
    imageUrl: raw.imageUrl ?? raw.images?.[0]?.url ?? null,
    slug: raw.slug,
    inStock: raw.inStock ?? raw.available,
    hasVariants: raw.hasVariants ?? false,
    options: raw.options ?? [],
    variants: (raw.variants ?? []).map(v => ({
      id: v.id,
      label: v.label,
      selection: v.selection,
      price: v.price,
      discountPrice: v.salePrice ?? null,
      inStock: v.inStock,
      available: v.available,
    })),
    addonGroups: (raw.modifierGroups ?? []).map(g => ({
      id: g.id,
      name: g.name,
      minSelect: g.minSelect,
      maxSelect: g.maxSelect,
      options: g.options,
    })),
    images: (raw.images ?? []).map(i => i.url),
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

function businessHoursLabel(hours?: PublicBusinessHours): string {
  if (!hours || hours.status === 'NOT_CONFIGURED') return 'Hours not available';
  const time = (value: string | null) => value ? value.slice(0, 5) : '';
  if (hours.status === 'OPEN') return hours.closesAt ? `Open now · closes at ${time(hours.closesAt)}` : 'Open now';
  return hours.opensAt ? `Closed · opens at ${time(hours.opensAt)}` : 'Closed';
}

function mapStore(raw: ApiStoreRaw, businessHours?: PublicBusinessHours): PublicStore {
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
    openingHours: businessHoursLabel(businessHours),
    deliveryInfo: null,
    currencyCode: raw.currency ?? '',
    // Templates format money via formatMoney(amount, currencySuffix): the store's ISO code.
    currencySuffix: raw.currency ?? '',
    timezone: raw.timezone,
    locale: raw.locale,
    businessHours,
    acceptingOrders: raw.acceptingOrders,
  };
}

export async function fetchStorefront(slug: string): Promise<StorefrontData | null> {
  const apiBase = getApiBase();
  const encodedSlug = encodeURIComponent(slug);

  const storeRes = await fetch(`${apiBase}/api/public/stores/${encodedSlug}`, {
    next: { revalidate: 60 },
  });

  // Only the canonical store lookup can establish that the requested store does not exist.
  // Every other non-success response is an application/API failure, not a missing store.
  if (storeRes.status === 404) return null;

  const rawStore = await readApiData<ApiStoreRaw>(storeRes, 'store');
  if (!isRecord(rawStore) || typeof rawStore.id !== 'string' || typeof rawStore.name !== 'string' || typeof rawStore.slug !== 'string' || typeof rawStore.currency !== 'string') {
    throw new StorefrontApiError('Storefront store data was malformed.');
  }
  const [hoursRes, productsRes, themeRes, categoriesRes] = await Promise.all([
    fetch(`${apiBase}/api/public/stores/${encodedSlug}/business-hours`, { next: { revalidate: 60 } }),
    fetch(`${apiBase}/api/public/stores/${encodedSlug}/products`, { next: { revalidate: 60 } }),
    fetch(`${apiBase}/api/public/stores/${encodedSlug}/theme-content`, { next: { revalidate: 60 } }),
    fetch(`${apiBase}/api/public/stores/${encodedSlug}/categories`, { next: { revalidate: 60 } }),
  ]);

  const businessHours = await readApiData<PublicBusinessHours>(hoursRes, 'business-hours');
  if (!isRecord(businessHours) || !Array.isArray(businessHours.days) || typeof businessHours.status !== 'string') {
    throw new StorefrontApiError('Storefront business-hours data was malformed.');
  }
  const store = mapStore(rawStore, businessHours);

  const rawCategories = await readApiData<ApiCategoryRaw[]>(categoriesRes, 'categories');
  if (!Array.isArray(rawCategories) || rawCategories.some(category =>
    !isRecord(category) || typeof category.id !== 'string' || typeof category.nameEn !== 'string')) {
    throw new StorefrontApiError('Storefront category data was malformed.');
  }
  const categoryNames = new Map(rawCategories.map(category => [category.id, category.nameEn]));

  const rawProducts = await readApiData<ApiProductRaw[]>(productsRes, 'products');
  if (!Array.isArray(rawProducts)) {
    throw new StorefrontApiError('Storefront product data was malformed.');
  }
  const products = rawProducts.map(product => {
    if (!isRecord(product) || typeof product.id !== 'string' || typeof product.nameEn !== 'string'
      || typeof product.price !== 'number' || typeof product.available !== 'boolean') {
      throw new StorefrontApiError('Storefront product data was malformed.');
    }
    return mapProduct(product as ApiProductRaw, categoryNames);
  });

  // Backend content is opaque JSON regardless of which template shape it holds.
  const publishedContent = await readApiData<unknown>(themeRes, 'theme content');
  if (publishedContent !== null && !isRecord(publishedContent)) {
    throw new StorefrontApiError('Storefront theme content was malformed.');
  }

  return {
    store,
    products,
    templateContent: publishedContent as TemplateContent | undefined,
  };
}
