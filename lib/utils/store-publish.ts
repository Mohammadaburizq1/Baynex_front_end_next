import type { Store } from '@/lib/types';
import type { ApiStore } from '@/lib/api/stores';

// The backend requires name/slug/categorySlug on every PUT (they're @NotBlank), so a
// status-only PUT would 400 — always resend the store's current required fields alongside it.
export async function setStorePublished(store: Store, published: boolean): Promise<ApiStore> {
  const { updateStore } = await import('@/lib/api/stores');
  return updateStore(store.id, {
    name: store.name,
    slug: store.slug,
    categorySlug: store.category || 'general-store',
    description: store.description || undefined,
    phone: store.phone || undefined,
    email: store.email || undefined,
    address: store.address || undefined,
    status: published ? 'ACTIVE' : 'DRAFT',
  });
}

// StoreService.update() rejects status: "ACTIVE" with this message (via IllegalArgumentException)
// when the store has no products yet — matched by substring so wording tweaks on either side
// don't silently break detection.
export function isNoProductsPublishError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  return message.toLowerCase().includes('at least one product');
}

// Real backend product count for this store — used to decide publish-gate messaging.
// Note: getProducts() returns every product across all of this merchant's stores, so it's
// filtered down to the one we care about.
export async function storeHasProducts(storeId: string): Promise<boolean> {
  const { getProducts } = await import('@/lib/api/products');
  const products = await getProducts();
  return products.some(p => p.storeId === storeId);
}
