'use client';

import { useEffect, useState } from 'react';
import PetalStudioTemplate from '@/components/storefront/clothing/PetalStudioTemplate';
import FashionEditorialTemplate from '@/components/storefront/clothing/FashionEditorialTemplate';
import VoidDripTemplate from '@/components/storefront/clothing/VoidDripTemplate';
import { defaultClothingContent } from '@/lib/data/clothing-presets';
import type { StorefrontData } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import type { StorefrontTemplate } from '@/lib/utils/template-resolver';
import {
  loadTemplateContentForSlug,
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
  const [content, setContent] = useState<ClothingTemplateContent>(() =>
    defaultClothingContent(templateId),
  );

  useEffect(() => {
    const draft = loadTemplateDraft();
    if (draft?.templateId === templateId) {
      setContent(mergeClothingContent(templateId, draft.content));
      return;
    }
    setContent(loadTemplateContentForSlug(data.store.slug, templateId));
  }, [templateId, data.store.slug]);

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
