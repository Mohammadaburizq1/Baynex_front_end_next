'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, Palette, Save } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { ClothingTemplateEditor } from '@/components/dashboard/ClothingTemplateEditor';
import { TemplateEditor } from '@/components/dashboard/TemplateEditor';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { defaultClothingContent, isClothingTemplateId } from '@/lib/data/clothing-presets';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import {
  loadTemplateContentForSlug as loadClothingContent,
  saveTemplateContentForSlug as saveClothingContent,
  saveTemplateDraft as saveClothingDraft,
} from '@/lib/utils/clothing-content';
import type { TemplateContent } from '@/lib/types/template-content';
import {
  loadSavedTemplateContent,
  mergeTemplateContent,
  saveDraft,
  saveTemplateContent,
} from '@/lib/utils/template-content';
import { getTemplateCategory } from '@/lib/data/template-presets';
import { resolveTemplate } from '@/lib/utils/template-resolver';

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
  const { store, updateStore } = useStore();
  const { success } = useToast();

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

  useEffect(() => {
    if (isClothing) {
      setClothingContent(loadClothingContent(store.slug, templateId));
    } else {
      setContent(loadSavedTemplateContent(store.slug, templateId));
    }
  }, [store.slug, templateId, isClothing]);

  const previewUrl = useMemo(() => {
    if (isClothing) {
      return `/templates/${templateId}?preview=1&slug=${encodeURIComponent(store.slug)}&t=${previewRev}`;
    }
    return `/store/${encodeURIComponent(store.slug)}?t=${previewRev}`;
  }, [isClothing, templateId, store.slug, previewRev]);

  // ── Clothing handlers ─────────────────────────────────────────────────
  const handleClothingChange = useCallback(
    (next: ClothingTemplateContent) => {
      setClothingContent(next);
      saveClothingDraft(templateId, next);
      try { window.dispatchEvent(new CustomEvent('shoplink:template-draft')); } catch { /* ignore */ }
    },
    [templateId],
  );

  const handleClothingSave = () => {
    saveClothingContent(store.slug, clothingContent);
    updateStore({
      description: clothingContent.heroDescription,
      coverImage: clothingContent.heroImageUrl,
      templateContent: clothingContent as unknown as TemplateContent,
    });
    setPreviewRev(Date.now());
    success('Storefront saved — open preview to see changes');
  };

  // ── Universal template handlers ───────────────────────────────────────
  const handleChange = useCallback(
    (next: TemplateContent) => {
      setContent(next);
      saveDraft(templateId, next);
      try { window.dispatchEvent(new CustomEvent('shoplink:template-draft')); } catch { /* ignore */ }
    },
    [templateId],
  );

  const handleSave = () => {
    saveTemplateContent(store.slug, content);
    updateStore({ description: content.heroDescription, coverImage: content.heroImageUrl });
    setPreviewRev(Date.now());
    success('Storefront saved — open preview to see changes');
  };

  return (
    <>
      <Header
        title="Customize Storefront"
        subtitle={`${categoryLabel} — ${templateId}`}
      />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-5 lg:p-6 max-w-6xl mx-auto pb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={isClothing ? handleClothingSave : handleSave} className="gap-2">
              <Save size={16} />
              Save changes
            </Button>
            <a href={previewUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="gap-2">
                <ExternalLink size={16} />
                Open live preview
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Palette size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-900">Template content</h2>
                <span className="ml-auto text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {categoryLabel}
                </span>
              </div>

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
