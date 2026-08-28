import type { TemplateContent } from '@/lib/types/template-content';
import { getTemplateDefaults } from '@/lib/data/template-presets';

const KEY = (slug: string) => `shoplink_tpl_${slug}`;
const DRAFT_KEY = 'shoplink_tpl_draft';

function merge(
  base: TemplateContent,
  overrides: Partial<TemplateContent>,
): TemplateContent {
  return {
    ...base,
    ...overrides,
    // preserve default arrays when overrides are empty
    lookbookItems:
      overrides.lookbookItems?.length ? overrides.lookbookItems : base.lookbookItems,
    testimonials:
      overrides.testimonials?.length ? overrides.testimonials : base.testimonials,
  };
}

export function mergeTemplateContent(
  templateId: string,
  overrides?: Partial<TemplateContent> | null,
): TemplateContent {
  const base = getTemplateDefaults(templateId);
  return overrides ? merge(base, overrides) : base;
}

export function saveTemplateContent(slug: string, content: Partial<TemplateContent>): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(KEY(slug), JSON.stringify(content)); } catch { /* ignore */ }
}

export function loadSavedTemplateContent(slug: string, templateId: string): TemplateContent {
  if (typeof window === 'undefined') return getTemplateDefaults(templateId);
  try {
    const raw = localStorage.getItem(KEY(slug));
    if (raw) return mergeTemplateContent(templateId, JSON.parse(raw));
  } catch { /* ignore */ }
  return getTemplateDefaults(templateId);
}

export function saveDraft(templateId: string, content: Partial<TemplateContent>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId, content, updatedAt: Date.now() }));
  } catch { /* ignore */ }
}

export function loadDraft(): { templateId: string; content: Partial<TemplateContent> } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.templateId ? parsed : null;
  } catch { return null; }
}

/** Read draft-first, then saved, then defaults. Used by StorefrontRenderer. */
export function readTemplateContent(slug: string, templateId: string): TemplateContent {
  const draft = loadDraft();
  if (draft?.templateId === templateId) {
    return mergeTemplateContent(templateId, draft.content);
  }
  return loadSavedTemplateContent(slug, templateId);
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
}

export function parseList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(s => s.trim()).filter(Boolean);
}
