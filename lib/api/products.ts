import { apiRequest } from './client';

// UI-facing shape consumed by the dashboard Products page (apiToProduct/productToForm).
export interface ApiProduct {
  id: string;
  storeId?: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  comparePrice?: number;
  category?: string;
  categoryId?: string;
  imageUrl?: string;
  images?: string[];
  stock: number;
  sku?: string;
  available?: boolean;
  status: 'active' | 'inactive' | 'out_of_stock';
  featured?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Actual shape of com.byonix.shoplink.api.dto.ProductDtos.ProductResponse. The backend has no
// stock/quantity model (only `available`), no free-text `category` (only a `categoryId` UUID —
// resolving it to a name would need a separate categories fetch, not done here), and no
// `tags`/`images` array (`imageUrl` is the only image). None of those can be faithfully mapped;
// see mapProduct's comments for exactly what each ApiProduct field is derived from.
interface ApiProductRaw {
  id: string;
  storeId: string;
  categoryId?: string | null;
  nameEn: string;
  slug: string;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl?: string | null;
  sku?: string | null;
  available: boolean;
  featured: boolean;
}

function mapProduct(raw: ApiProductRaw): ApiProduct {
  return {
    id: raw.id,
    storeId: raw.storeId,
    slug: raw.slug,
    name: raw.nameEn,
    description: raw.description ?? '',
    price: raw.price,
    discountPrice: raw.salePrice ?? undefined,
    comparePrice: raw.salePrice ?? undefined,
    categoryId: raw.categoryId ?? undefined,
    category: '', // no category name on this response — only categoryId (a UUID)
    imageUrl: raw.imageUrl ?? undefined,
    images: raw.imageUrl ? [raw.imageUrl] : [],
    // Backend has no inventory count — 1/0 stands in for "in stock"/"out of stock" so the
    // existing stock>0 gates keep working; it is never a real quantity.
    stock: raw.available ? 1 : 0,
    sku: raw.sku ?? undefined,
    available: raw.available,
    // Backend only has the `available` boolean — 'out_of_stock' can't be derived (no real
    // stock count) so it's never produced here; only a merchant explicitly choosing "Out of
    // Stock" in the form (see toProductRequest) can set that specific local status.
    status: raw.available ? 'active' : 'inactive',
    featured: raw.featured,
  };
}

// name -> slug, plus a short random suffix so two products with the same name in the same
// store don't collide against the backend's UNIQUE (store_id, slug) constraint.
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'item'}-${suffix}`;
}

// Maps the UI form's Partial<ApiProduct> into com.byonix.shoplink.api.dto.ProductDtos.ProductRequest.
// storeId and nameEn/slug are @NotNull/@NotBlank on the backend, so they're always sent even
// though ApiProduct itself only carries storeId optionally. `stock` is intentionally dropped —
// the backend has nowhere to persist it (see the ApiProductRaw comment above); the Products
// page's "Stock" field is not yet backed by anything server-side.
function toProductRequest(storeId: string, data: Partial<ApiProduct>) {
  return {
    storeId,
    categoryId: data.categoryId || undefined,
    nameEn: (data.name ?? '').trim(),
    slug: data.slug || slugify(data.name ?? ''),
    description: data.description || undefined,
    price: data.price ?? 0,
    salePrice: data.discountPrice ?? data.comparePrice ?? undefined,
    imageUrl: data.imageUrl || undefined,
    sku: data.sku || undefined,
    available: data.status !== 'inactive' && data.status !== 'out_of_stock',
    featured: data.featured ?? false,
    sortOrder: 0,
  };
}

export async function getProducts(): Promise<ApiProduct[]> {
  const raw = await apiRequest<ApiProductRaw[]>('/api/dashboard/products');
  return raw.map(mapProduct);
}

export async function getProduct(id: string): Promise<ApiProduct> {
  return mapProduct(await apiRequest<ApiProductRaw>(`/api/dashboard/products/${id}`));
}

export async function createProduct(storeId: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  const raw = await apiRequest<ApiProductRaw>('/api/dashboard/products', {
    method: 'POST',
    body: JSON.stringify(toProductRequest(storeId, data)),
  });
  return mapProduct(raw);
}

export async function updateProduct(id: string, storeId: string, data: Partial<ApiProduct>): Promise<ApiProduct> {
  const raw = await apiRequest<ApiProductRaw>(`/api/dashboard/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toProductRequest(storeId, data)),
  });
  return mapProduct(raw);
}

export async function deleteProduct(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/products/${id}`, { method: 'DELETE' });
}
