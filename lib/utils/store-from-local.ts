import type { Store } from '@/lib/types';
import { loadTemplateContentForSlug } from '@/lib/utils/clothing-content';
import { isClothingTemplateId } from '@/lib/data/clothing-presets';

const DEFAULTS: Store = {
  id: '',
  name: 'My Store',
  slug: '',
  businessType: 'retail',
  category: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  currency: 'JOD',
  timezone: 'UTC',
  locale: 'en',
  // Matches the backend default (StoreService.create() always starts DRAFT) for the moment
  // before real data (localStorage or a backend fetch) is known.
  status: 'draft',
  acceptingOrders: true,
  theme: 'retail-classic',
  createdAt: new Date().toISOString(),
};

export function readSavedStore(): Partial<Store> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('shoplink_store');
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Store>;
  } catch {
    return null;
  }
}

export function buildStoreFromSaved(parsed: Partial<Store>): Store {
  const theme = parsed.theme ?? DEFAULTS.theme;
  const slug = parsed.slug ?? DEFAULTS.slug;
  let templateContent = parsed.templateContent;
  if (!templateContent && isClothingTemplateId(theme) && slug) {
    templateContent = loadTemplateContentForSlug(slug, theme);
  }

  return {
    ...DEFAULTS,
    ...parsed,
    theme,
    slug,
    templateContent,
    id: parsed.id ?? (slug ? `local-${slug}` : DEFAULTS.id),
    name: parsed.name ?? DEFAULTS.name,
    businessType: parsed.businessType ?? DEFAULTS.businessType,
  };
}

export function hydrateStoreFromLocal(): Store | null {
  const saved = readSavedStore();
  if (!saved?.slug) return null;
  return buildStoreFromSaved(saved);
}
