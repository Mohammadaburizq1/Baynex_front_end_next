'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PetalStudioTemplate from '@/components/storefront/clothing/PetalStudioTemplate';
import FashionEditorialTemplate from '@/components/storefront/clothing/FashionEditorialTemplate';
import VoidDripTemplate from '@/components/storefront/clothing/VoidDripTemplate';
import type { StorefrontData } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import type { StorefrontTemplate } from '@/lib/utils/template-resolver';
import {
  loadTemplateDraft,
  mergeClothingContent,
} from '@/lib/utils/clothing-content';

interface ClothingStorefrontProps {
  data: StorefrontData;
  template: StorefrontTemplate;
}

function templateToId(template: StorefrontTemplate): string {
  if (template === 'clothing-streetwear') return 'clothing-streetwear';
  if (template === 'clothing-boutique') return 'clothing-boutique';
  return 'clothing-editorial';
}

export function ClothingStorefront({ data, template }: ClothingStorefrontProps) {
  const templateId = templateToId(template);
  const isPreview = useSearchParams().get('preview') === '1';

  // Real storefront: backend-published content, fetched server-side into `data` — no
  // localStorage involved, works on a fresh browser with nothing cached locally.
  // The preset testimonials are illustrative: a real store shows only testimonials its merchant
  // actually published, never the defaults (the /templates showcase still shows them).
  const [content, setContent] = useState<ClothingTemplateContent>(() => {
    const published = data.templateContent as Partial<ClothingTemplateContent> | undefined;
    const merged = mergeClothingContent(templateId, published);
    return data.demo || (published?.testimonials?.length ?? 0) > 0 ? merged : { ...merged, testimonials: [] };
  });

  useEffect(() => {
    // Preview mode (dashboard editor iframe) overlays the merchant's in-progress, unpublished
    // edits via the same-tab draft bridge — see lib/utils/clothing-content.ts.
    if (!isPreview) return;
    function applyDraft() {
      const draft = loadTemplateDraft();
      if (draft?.templateId === templateId) {
        setContent(mergeClothingContent(templateId, draft.content));
      }
    }
    applyDraft();
    window.addEventListener('storage', applyDraft);
    window.addEventListener('shoplink:template-draft', applyDraft);
    return () => {
      window.removeEventListener('storage', applyDraft);
      window.removeEventListener('shoplink:template-draft', applyDraft);
    };
  }, [templateId, isPreview]);

  switch (template) {
    case 'clothing-boutique':
      return <PetalStudioTemplate data={data} content={content} />;
    case 'clothing-streetwear':
      return <VoidDripTemplate data={data} content={content} />;
    case 'clothing-editorial':
      return <FashionEditorialTemplate data={data} content={content} />;
    default:
      return <PetalStudioTemplate data={data} content={content} />;
  }
}
