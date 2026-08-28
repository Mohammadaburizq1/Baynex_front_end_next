// Persists an in-progress cart across the redirect to /customer/login and back.
// Cart state itself lives in plain useState per template, which would otherwise
// be lost on navigation. Only id+qty is stored — templates rehydrate full cart
// items from the `products` array they already have from the page load.
//
// Reference implementation — see restaurant-default/RestaurantDefaultPage.tsx
// and street-food/StreetFoodPopTemplate.tsx.

export interface CartDraftItem {
  productId: string;
  qty: number;
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
