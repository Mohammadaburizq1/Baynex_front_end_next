import { apiRequest } from './client';

// UI-facing shape of com.byonix.shoplink.api.dto.CategoryDtos.CategoryResponse.
export interface ApiCategory {
  id: string;
  storeId: string | null;
  parentId: string | null;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  active: boolean;
}

interface ApiCategoryRaw {
  id: string;
  storeId?: string | null;
  parentId?: string | null;
  nameEn: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  active: boolean;
  categoryType: 'BUSINESS' | 'PRODUCT';
}

export interface CategoryInput {
  name: string;
  parentId?: string | null;
  description?: string;
  sortOrder?: number;
  active?: boolean;
}

function mapCategory(raw: ApiCategoryRaw): ApiCategory {
  return {
    id: raw.id,
    storeId: raw.storeId ?? null,
    parentId: raw.parentId ?? null,
    name: raw.nameEn,
    slug: raw.slug,
    description: raw.description ?? undefined,
    sortOrder: raw.sortOrder,
    active: raw.active,
  };
}

export function slugifyCategory(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 110);
  return base || 'category';
}

function toRequest(storeId: string, slug: string, input: CategoryInput) {
  return {
    storeId,
    parentId: input.parentId || undefined,
    nameEn: input.name.trim(),
    slug,
    description: input.description?.trim() || undefined,
    sortOrder: input.sortOrder ?? 0,
    active: input.active ?? true,
    categoryType: 'PRODUCT' as const,
  };
}

/** The store's own product categories (the dashboard endpoint returns every store the user can see). */
export async function getCategories(storeId: string): Promise<ApiCategory[]> {
  const raw = await apiRequest<ApiCategoryRaw[]>('/api/dashboard/categories');
  return raw
    .filter(c => c.storeId === storeId && c.categoryType === 'PRODUCT')
    .map(mapCategory);
}

// Slugs are unique per store (the backend answers 409 with "…URL slug…already exists"). The slug
// is an internal detail the merchant never types, so on a clash quietly try "-2", "-3", … instead
// of surfacing an error they can't act on.
export async function createCategory(storeId: string, input: CategoryInput): Promise<ApiCategory> {
  const base = slugifyCategory(input.name);
  let lastError: unknown;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    try {
      const raw = await apiRequest<ApiCategoryRaw>('/api/dashboard/categories', {
        method: 'POST',
        body: JSON.stringify(toRequest(storeId, slug, input)),
      });
      return mapCategory(raw);
    } catch (e) {
      lastError = e;
      if (!(e instanceof Error) || !e.message.includes('URL slug')) throw e;
    }
  }
  throw lastError;
}

// The slug is kept as-is on update: renaming a category shouldn't churn its URL.
export async function updateCategory(category: ApiCategory, storeId: string, input: CategoryInput): Promise<ApiCategory> {
  const raw = await apiRequest<ApiCategoryRaw>(`/api/dashboard/categories/${category.id}`, {
    method: 'PUT',
    body: JSON.stringify(toRequest(storeId, category.slug, input)),
  });
  return mapCategory(raw);
}

export async function deleteCategory(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/categories/${id}`, { method: 'DELETE' });
}
