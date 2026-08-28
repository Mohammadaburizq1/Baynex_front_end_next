import { getMockStore } from '@/lib/data/mock-stores';
import { defaultClothingContent, isClothingTemplateId } from '@/lib/data/clothing-presets';
import type { Store } from '@/lib/types';
import type { StorefrontData, StoreBusinessType } from '@/lib/types/store';
import { mergeClothingContent } from '@/lib/utils/clothing-content';

const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Women's Boutique",
  restaurant: 'Restaurant',
  retail: 'Retail Store',
  real_estate: 'Real Estate',
  services: 'Services',
  catalog: 'Catalogue',
};

function toBusinessType(value: string | undefined): StoreBusinessType {
  if (
    value === 'clothing'
    || value === 'restaurant'
    || value === 'retail'
    || value === 'real_estate'
    || value === 'services'
    || value === 'catalog'
    || value === 'medical'
  ) {
    return value;
  }
  return 'retail';
}

export function readLocalStore(): Partial<Store> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('shoplink_store');
    if (!raw) return null;
    return JSON.parse(raw) as Partial<Store>;
  } catch {
    return null;
  }
}

export function buildStorefrontFromLocal(
  saved: Partial<Store>,
  slug: string,
): StorefrontData | null {
  if (!saved.slug || saved.slug !== slug) return null;

  const templateId = saved.theme ?? 'retail-classic';
  const mock = getMockStore(templateId);
  const businessType = toBusinessType(saved.businessType);
  const subCategory = isClothingTemplateId(templateId)
    ? templateId
    : mock.store.businessSubCategorySlug;

  return {
    products: mock.products,
    store: {
      ...mock.store,
      slug,
      shopName: saved.name ?? mock.store.shopName,
      description: saved.description ?? mock.store.description,
      businessType,
      businessSubCategorySlug: subCategory,
      mainBusinessCategoryLabel:
        CATEGORY_LABELS[businessType] ?? mock.store.mainBusinessCategoryLabel,
      primaryColor: mock.store.primaryColor,
      logoUrl: saved.logo ?? mock.store.logoUrl,
      whatsappNumber: saved.phone ?? mock.store.whatsappNumber,
    },
  };
}

export function loadLocalStorefront(slug: string): StorefrontData | null {
  const saved = readLocalStore();
  if (saved) {
    const fromStore = buildStorefrontFromLocal(saved, slug);
    if (fromStore) return fromStore;
  }

  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`shoplink_template_content_${slug}`);
    if (!raw) return null;

    const overrides = JSON.parse(raw);
    const templateId = inferTemplateId(saved, overrides);
    if (!isClothingTemplateId(templateId)) return null;

    const content = mergeClothingContent(templateId, overrides);
    const mock = getMockStore(templateId);

    return {
      products: mock.products,
      store: {
        ...mock.store,
        slug,
        shopName: saved?.name ?? mock.store.shopName,
        description: content.heroDescription ?? saved?.description ?? mock.store.description,
        businessType: 'clothing',
        businessSubCategorySlug: templateId,
        mainBusinessCategoryLabel: "Women's Boutique",
        logoUrl: saved?.logo ?? mock.store.logoUrl,
        whatsappNumber: saved?.phone ?? mock.store.whatsappNumber,
      },
    };
  } catch {
    return null;
  }
}

function inferTemplateId(
  saved: Partial<Store> | null,
  overrides: Record<string, unknown>,
): string {
  if (saved?.theme && isClothingTemplateId(saved.theme)) return saved.theme;

  try {
    const draft = localStorage.getItem('shoplink_template_draft');
    if (draft) {
      const parsed = JSON.parse(draft);
      if (isClothingTemplateId(parsed?.templateId)) return parsed.templateId;
    }
  } catch { /* ignore */ }

  if (typeof overrides.heroTitleLine1 === 'string') return 'clothing-boutique';
  return 'clothing-boutique';
}
