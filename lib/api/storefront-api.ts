import type { StorefrontData } from '../types/store';
import { DEMO_RESTAURANT } from '../data/mock-store';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export async function fetchStorefront(slug: string): Promise<StorefrontData | null> {
  // Fall back to demo data when no API is configured or slug is the demo.
  if (!API_BASE || slug === 'demo-restaurant') {
    if (slug === 'demo-restaurant' || !API_BASE) {
      return { ...DEMO_RESTAURANT, store: { ...DEMO_RESTAURANT.store, slug } };
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/public/stores/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json() as Promise<StorefrontData>;
  } catch {
    // If API is unreachable return demo data so the page still renders.
    return { ...DEMO_RESTAURANT, store: { ...DEMO_RESTAURANT.store, slug } };
  }
}
