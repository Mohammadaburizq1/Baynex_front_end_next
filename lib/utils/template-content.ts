import type { TemplateContent } from '@/lib/types/template-content';
import { CURRENT_TEMPLATE_CONTENT_SCHEMA_VERSION } from '@/lib/types/template-content';
import { getTemplateDefaults } from '@/lib/data/template-presets';
import { saveThemeDraft } from '@/lib/api/theme-content';

const KEY = (slug: string) => `shoplink_tpl_${slug}`;
const DRAFT_KEY = 'shoplink_tpl_draft';

/**
 * Upgrades a content blob loaded from the backend (or localStorage) to the current
 * TemplateContent shape. A no-op today (only schema version 1 exists) — the seam future field
 * renames/restructures plug into, keyed off the saved schemaVersion. Called from
 * mergeTemplateContent() below, so every load path runs through it.
 */
export function migrateTemplateContent(raw: Partial<TemplateContent>): Partial<TemplateContent> {
  switch (raw.schemaVersion) {
    case CURRENT_TEMPLATE_CONTENT_SCHEMA_VERSION:
    case undefined:
    default:
      return { ...raw, schemaVersion: CURRENT_TEMPLATE_CONTENT_SCHEMA_VERSION };
  }
}

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
  return overrides ? merge(base, migrateTemplateContent(overrides)) : base;
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

const backendDraftTimers = new Map<string, ReturnType<typeof setTimeout>>();
const BACKEND_DRAFT_DEBOUNCE_MS = 800;

/**
 * Durable backend draft save, debounced per store so rapid edits (typing) don't fire a request
 * per keystroke. Separate from saveDraft()/loadDraft() above, which drive the instant same-tab
 * live-preview iframe and stay purely local.
 */
export function persistDraftDebounced(storeId: string, content: Record<string, unknown>): void {
  const existing = backendDraftTimers.get(storeId);
  if (existing) clearTimeout(existing);
  backendDraftTimers.set(
    storeId,
    setTimeout(() => {
      backendDraftTimers.delete(storeId);
      saveThemeDraft(storeId, content).catch(() => { /* next debounced/explicit save will retry */ });
    }, BACKEND_DRAFT_DEBOUNCE_MS),
  );
}

/** Bypasses the debounce — used by an explicit "Save" click. */
export function flushDraftToBackend(storeId: string, content: Record<string, unknown>): Promise<void> {
  const existing = backendDraftTimers.get(storeId);
  if (existing) {
    clearTimeout(existing);
    backendDraftTimers.delete(storeId);
  }
  return saveThemeDraft(storeId, content).then(() => undefined);
}

export function parseList(value: string | undefined): string[] {
  return (value ?? '').split(',').map(s => s.trim()).filter(Boolean);
}
