// Persists an in-progress cart across the redirect to /customer/login and back.
// Cart state itself lives in plain useState per template, which would otherwise
// be lost on navigation. Only ids and quantities are stored (product, variant, add-ons) —
// templates rehydrate full cart lines from the `products` array they already have from the page
// load (see restoreFromDraft in cart-lines.ts).
//
// Reference implementation — see restaurant-default/RestaurantDefaultPage.tsx
// and street-food/StreetFoodPopTemplate.tsx.

export interface CartDraftItem {
  productId: string;
  qty: number;
  // Optional so drafts saved before variants/add-ons existed still load.
  variantId?: string;
  modifierOptionIds?: string[];
}

function key(slug: string): string {
  return `shoplink:cart:${slug}`;
}

export function saveCartDraft(slug: string, items: CartDraftItem[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key(slug), JSON.stringify(items));
}

export function readCartDraft(slug: string): CartDraftItem[] | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(key(slug));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CartDraftItem[];
  } catch {
    return null;
  }
}

export function clearCartDraft(slug: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(key(slug));
}
