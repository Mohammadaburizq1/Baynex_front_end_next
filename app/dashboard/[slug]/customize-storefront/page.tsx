'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, History, Palette, Rocket, Save } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { ClothingTemplateEditor } from '@/components/dashboard/ClothingTemplateEditor';
import { TemplateEditor } from '@/components/dashboard/TemplateEditor';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { defaultClothingContent, isClothingTemplateId } from '@/lib/data/clothing-presets';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import {
  mergeClothingContent,
  saveTemplateContentForSlug as saveClothingContent,
  saveTemplateDraft as saveClothingDraft,
} from '@/lib/utils/clothing-content';
import type { TemplateContent } from '@/lib/types/template-content';
import {
  mergeTemplateContent,
  saveDraft,
  saveTemplateContent,
  persistDraftDebounced,
  flushDraftToBackend,
} from '@/lib/utils/template-content';
import { getTemplateCategory } from '@/lib/data/template-presets';
import { resolveTemplate } from '@/lib/utils/template-resolver';
import {
  getThemeContent,
  publishThemeContent,
  listThemeContentVersions,
  restoreThemeContentVersion,
  type ThemeContentVersion,
} from '@/lib/api/theme-content';

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: 'Restaurant & Food',
  coffee: 'Coffee & Café',
  'street-food': 'Street Food',
  retail: 'Retail & Shop',
  'real-estate': 'Real Estate',
  services: 'Services',
  medical: 'Medical & Clinic',
  clothing: 'Clothing & Fashion',
};

export default function CustomizeStorefrontPage() {
  return (
    <SectionAccessGate section="STOREFRONT" pageTitle="Customize Storefront">
      <CustomizeStorefrontContent />
    </SectionAccessGate>
  );
}

function CustomizeStorefrontContent() {
  const { store, updateStore, permissions } = useStore();
  const { success, error: showError } = useToast();
  // VIEW = can open the page and browse the draft/version history; only EDIT may change or
  // publish anything. The backend enforces the same split (StoreThemeContentService) — this is
  // just so a VIEW-level staff member isn't shown controls that would 403.
  const canEdit = permissions.STOREFRONT === 'EDIT';

  const templateId = useMemo(() => {
    try {
      return resolveTemplate({
        businessType: store.businessType as never,
        businessSubCategorySlug: store.theme ?? null,
      } as never);
    } catch {
      return store.theme ?? 'restaurant-default';
    }
  }, [store.businessType, store.theme]);

  const isClothing = isClothingTemplateId(templateId);
  const category = getTemplateCategory(templateId);
  const categoryLabel = CATEGORY_LABELS[category] ?? category;

  // Clothing uses the existing ClothingTemplateContent system
  const [clothingContent, setClothingContent] = useState<ClothingTemplateContent>(() =>
    defaultClothingContent(templateId),
  );

  // All other templates use universal TemplateContent
  const [content, setContent] = useState<TemplateContent>(() =>
    mergeTemplateContent(templateId),
  );

  const [previewRev, setPreviewRev] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [publishedVersion, setPublishedVersion] = useState(0);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [hasPublishedContent, setHasPublishedContent] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [versions, setVersions] = useState<ThemeContentVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  const computeDirty = (draftContent: unknown, publishedContent: unknown, published: boolean) =>
    !published || JSON.stringify(draftContent ?? {}) !== JSON.stringify(publishedContent ?? {});

  // Load the merchant's current draft from the backend — falls back to built-in defaults for a
  // store that has never been customized. Also seeds the local same-tab draft bridge so opening
  // "live preview" immediately (before typing anything) reflects this content, not baked-in
  // defaults or a stale draft from a previous store.
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    getThemeContent(store.id)
      .then(res => {
        if (cancelled) return;
        const published = res.publishedContent != null;
        setPublishedVersion(res.publishedVersion);
        setPublishedAt(res.publishedAt);
        setHasPublishedContent(published);
        setDirty(computeDirty(res.draftContent, res.publishedContent, published));
        if (isClothing) {
          const merged = mergeClothingContent(templateId, res.draftContent as unknown as Partial<ClothingTemplateContent>);
          setClothingContent(merged);
          saveClothingDraft(templateId, merged);
        } else {
          const merged = mergeTemplateContent(templateId, res.draftContent as unknown as Partial<TemplateContent>);
          setContent(merged);
          saveDraft(templateId, merged);
        }
      })
      .catch(() => showError('Could not load saved storefront content'))
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id, templateId, isClothing]);

  const previewUrl = useMemo(
    () => `/store/${encodeURIComponent(store.slug)}?preview=1&t=${previewRev}`,
    [store.slug, previewRev],
  );

  // ── Clothing handlers ─────────────────────────────────────────────────
  const handleClothingChange = useCallback(
    (next: ClothingTemplateContent) => {
      if (!canEdit) return;
      setClothingContent(next);
      setDirty(true);
      saveClothingDraft(templateId, next);
      persistDraftDebounced(store.id, next as unknown as Record<string, unknown>);
      try { window.dispatchEvent(new CustomEvent('shoplink:template-draft')); } catch { /* ignore */ }
    },
    [templateId, store.id, canEdit],
  );

  const handleClothingSave = async () => {
    try {
      await flushDraftToBackend(store.id, clothingContent as unknown as Record<string, unknown>);
      saveClothingContent(store.slug, clothingContent);
      updateStore({
        description: clothingContent.heroDescription,
        coverImage: clothingContent.heroImageUrl,
        templateContent: clothingContent,
      });
      setPreviewRev(Date.now());
      success('Draft saved — open preview to see changes');
    } catch {
      showError('Could not save draft — try again');
    }
  };

  // ── Universal template handlers ───────────────────────────────────────
  const handleChange = useCallback(
    (next: TemplateContent) => {
      if (!canEdit) return;
      setContent(next);
      setDirty(true);
      saveDraft(templateId, next);
      persistDraftDebounced(store.id, next as unknown as Record<string, unknown>);
      try { window.dispatchEvent(new CustomEvent('shoplink:template-draft')); } catch { /* ignore */ }
    },
    [templateId, store.id, canEdit],
  );

  const handleSave = async () => {
    try {
      await flushDraftToBackend(store.id, content as unknown as Record<string, unknown>);
      saveTemplateContent(store.slug, content);
      updateStore({ description: content.heroDescription, coverImage: content.heroImageUrl });
      setPreviewRev(Date.now());
      success('Draft saved — open preview to see changes');
    } catch {
      showError('Could not save draft — try again');
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await publishThemeContent(store.id);
      setPublishedVersion(res.publishedVersion);
      setPublishedAt(res.publishedAt);
      setHasPublishedContent(true);
      setDirty(false);
      success(`Published — live on your storefront (v${res.publishedVersion})`);
    } catch {
      showError('Publish failed — try again');
    } finally {
      setPublishing(false);
    }
  };

  const toggleVersions = async () => {
    const next = !showVersions;
    setShowVersions(next);
    if (next) {
      try {
        setVersions(await listThemeContentVersions(store.id));
      } catch {
        showError('Could not load version history');
      }
    }
  };

  const handleRestore = async (version: number) => {
    try {
      const res = await restoreThemeContentVersion(store.id, version);
      setDirty(computeDirty(res.draftContent, res.publishedContent, res.publishedContent != null));
      if (isClothing) {
        const merged = mergeClothingContent(templateId, res.draftContent as unknown as Partial<ClothingTemplateContent>);
        setClothingContent(merged);
        saveClothingDraft(templateId, merged);
      } else {
        const merged = mergeTemplateContent(templateId, res.draftContent as unknown as Partial<TemplateContent>);
        setContent(merged);
        saveDraft(templateId, merged);
      }
      try { window.dispatchEvent(new CustomEvent('shoplink:template-draft')); } catch { /* ignore */ }
      setPreviewRev(Date.now());
      success(`Version ${version} restored into your draft — Publish to make it live`);
    } catch {
      showError('Restore failed — try again');
    }
  };

  return (
    <>
      <Header
        title="Customize Storefront"
        subtitle={`${categoryLabel} — ${templateId}`}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-5 lg:p-6 max-w-6xl mx-auto pb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {canEdit && (
              <>
                <Button onClick={isClothing ? handleClothingSave : handleSave} variant="outline" className="gap-2" disabled={!loaded}>
                  <Save size={16} />
                  Save draft
                </Button>
                <Button onClick={handlePublish} className="gap-2" disabled={!loaded || !dirty} loading={publishing}>
                  <Rocket size={16} />
                  Publish
                </Button>
              </>
            )}
            <a href={previewUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink size={16} />
                Open live preview
              </Button>
            </a>
            <Button onClick={toggleVersions} variant="ghost" className="gap-2">
              <History size={16} />
              Version history
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-500">
            {hasPublishedContent ? (
              <span className={`px-2 py-0.5 rounded-full font-semibold ${dirty ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {dirty ? 'Unpublished changes' : `Published v${publishedVersion}`}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">Never published</span>
            )}
            {publishedAt && <span>Last published {new Date(publishedAt).toLocaleString()}</span>}
          </div>

          {showVersions && (
            <Card className="p-4 mb-6">
              <p className="text-sm font-bold text-slate-800 mb-3">Published versions</p>
              {versions.length === 0 ? (
                <p className="text-sm text-slate-400">No published versions yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {versions.map(v => (
                    <li key={v.version} className="flex items-center justify-between py-2 text-sm text-slate-700">
                      <span>v{v.version} — {new Date(v.publishedAt).toLocaleString()}</span>
                      {canEdit && (
                        <Button size="sm" variant="outline" onClick={() => handleRestore(v.version)}>
                          Restore to draft
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-900">Template content</h2>
                <span className="ml-auto text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {categoryLabel}
                </span>
              </div>

              {!canEdit && (
                <p className="mb-3 text-xs font-medium text-amber-700 bg-amber-50 rounded-md px-3 py-2">
                  View only — ask the store owner for edit access to change the storefront.
                </p>
              )}
              {/* A disabled fieldset natively disables every form control inside it, so a
                  VIEW-level member can read the draft but not type into it. */}
              <fieldset disabled={!canEdit} className="min-w-0 border-0 p-0 m-0">
                {isClothing ? (
                  <ClothingTemplateEditor
                    content={clothingContent}
                    onChange={handleClothingChange}
                    dark={false}
                  />
                ) : (
                  <TemplateEditor
                    templateId={templateId}
                    content={content}
                    onChange={handleChange}
                  />
                )}
              </fieldset>
            </Card>

            <Card className="p-0 overflow-hidden xl:sticky xl:top-0">
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">Live preview</p>
                <span className="text-xs text-slate-400 font-mono">{templateId}</span>
              </div>
              <iframe
                key={previewRev}
                title="Storefront preview"
                src={previewUrl}
                className="w-full bg-white border-0"
                style={{ height: 'min(80vh, 900px)' }}
              />
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
