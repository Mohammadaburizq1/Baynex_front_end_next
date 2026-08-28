'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import PetalStudioTemplate from '@/components/storefront/clothing/PetalStudioTemplate';
import FashionEditorialTemplate from '@/components/storefront/clothing/FashionEditorialTemplate';
import VoidDripTemplate from '@/components/storefront/clothing/VoidDripTemplate';
import { defaultClothingContent } from '@/lib/data/clothing-presets';
import type { StorefrontData } from '@/lib/types/store';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import {
  loadTemplateContentForSlug,
  loadTemplateDraft,
  mergeClothingContent,
} from '@/lib/utils/clothing-content';

interface ClothingTemplatePreviewProps {
  data: StorefrontData;
  templateId?: string;
  slug?: string;
}

export function ClothingTemplatePreview({
  data,
  templateId = 'clothing-boutique',
  slug: slugProp,
}: ClothingTemplatePreviewProps) {
  const searchParams = useSearchParams();
  const slug = slugProp ?? searchParams.get('slug') ?? data.store.slug;

  const [content, setContent] = useState<ClothingTemplateContent>(() =>
    defaultClothingContent(templateId),
  );

  const reloadContent = () => {
    const draft = loadTemplateDraft();
    if (draft?.templateId === templateId) {
      setContent(mergeClothingContent(templateId, draft.content));
      return;
    }
    if (slug) {
      setContent(loadTemplateContentForSlug(slug, templateId));
    }
  };

  useEffect(() => {
    reloadContent();
  }, [templateId, slug]);

  useEffect(() => {
    const onDraft = () => reloadContent();
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'shoplink_template_draft'
        || (slug && e.key === `shoplink_template_content_${slug}`)
      ) {
        reloadContent();
      }
    };
    window.addEventListener('shoplink:template-draft', onDraft);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('shoplink:template-draft', onDraft);
      window.removeEventListener('storage', onStorage);
    };
  }, [templateId, slug]);

  if (templateId === 'clothing-streetwear') {
    return <VoidDripTemplate data={data} content={content} />;
  }
  if (templateId === 'clothing-editorial') {
    return <FashionEditorialTemplate data={data} content={content} />;
  }
  return <PetalStudioTemplate data={data} content={content} />;
}

/** @deprecated use ClothingTemplatePreview */
export const ClothingBoutiquePreview = ClothingTemplatePreview;

export function ClothingTemplatePreviewGate(props: ClothingTemplatePreviewProps) {
  return <ClothingTemplatePreview {...props} />;
}
