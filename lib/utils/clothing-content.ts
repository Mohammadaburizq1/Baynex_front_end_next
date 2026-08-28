import { defaultClothingContent, isClothingTemplateId } from '@/lib/data/clothing-presets';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';

const STORAGE_PREFIX = 'shoplink_template_content_';
const DRAFT_KEY = 'shoplink_template_draft';

function mergeDeep(
  base: ClothingTemplateContent,
  overrides: Partial<ClothingTemplateContent>,
): ClothingTemplateContent {
  return {
    ...base,
    ...overrides,
    lookbookItems:
      overrides.lookbookItems && overrides.lookbookItems.length > 0
        ? overrides.lookbookItems
        : base.lookbookItems,
    testimonials:
      overrides.testimonials && overrides.testimonials.length > 0
        ? overrides.testimonials
        : base.testimonials,
  };
}

export function mergeClothingContent(
  templateId: string,
  overrides?: Partial<ClothingTemplateContent> | null,
): ClothingTemplateContent {
  const base = defaultClothingContent(templateId);
  if (!overrides) return base;
  return mergeDeep(base, overrides);
}

export function saveTemplateContentForSlug(
  slug: string,
  content: Partial<ClothingTemplateContent>,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${slug}`, JSON.stringify(content));
  } catch {
    /* ignore */
  }
}

export function loadTemplateContentForSlug(
  slug: string,
  templateId: string,
): ClothingTemplateContent {
  if (typeof window === 'undefined') {
    return defaultClothingContent(templateId);
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${slug}`);
    if (raw) {
      return mergeClothingContent(templateId, JSON.parse(raw));
    }
  } catch {
    /* ignore */
  }
  return defaultClothingContent(templateId);
}

export function saveTemplateDraft(
  templateId: string,
  content: Partial<ClothingTemplateContent>,
): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ templateId, content, updatedAt: Date.now() }),
    );
  } catch {
    /* ignore */
  }
}

export function loadTemplateDraft(): {
  templateId: string;
  content: Partial<ClothingTemplateContent>;
} | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.templateId || !isClothingTemplateId(parsed.templateId)) return null;
    return { templateId: parsed.templateId, content: parsed.content ?? {} };
  } catch {
    return null;
  }
}

export function parseNavLinks(navLinks: string): string[] {
  return navLinks
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export function parseSocialLinks(links: string): string[] {
  return parseNavLinks(links);
}
