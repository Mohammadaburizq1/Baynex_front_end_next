'use client';

import { useMemo } from 'react';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';

type FieldDef = {
  key: keyof ClothingTemplateContent;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  hint?: string;
};

const SECTIONS: { title: string; fields: FieldDef[] }[] = [
  {
    title: 'Navigation',
    fields: [
      {
        key: 'navLinks',
        label: 'Menu links (comma-separated)',
        placeholder: 'New In, Dresses, Tops, Accessories, About',
      },
    ],
  },
  {
    title: 'Hero section',
    fields: [
      { key: 'heroEyebrow', label: 'Eyebrow text', placeholder: 'New Collection 2025' },
      { key: 'heroTitleLine1', label: 'Headline line 1', placeholder: 'Dressed for the' },
      { key: 'heroTitleLine2', label: 'Headline line 2', placeholder: "moments you'll" },
      { key: 'heroTitleEmphasis', label: 'Headline emphasis (accent color)', placeholder: 'remember forever' },
      {
        key: 'heroDescription',
        label: 'Hero description',
        multiline: true,
        placeholder: 'Your brand story in 1–2 sentences…',
      },
      { key: 'heroImageUrl', label: 'Hero image URL', placeholder: 'https://…' },
      { key: 'primaryCta', label: 'Primary button', placeholder: 'Shop Now' },
      { key: 'secondaryCta', label: 'Secondary button', placeholder: 'New Arrivals' },
      { key: 'heroBadgeLabel', label: 'Image badge label', placeholder: 'NEW IN' },
      { key: 'heroBadgeSubtitle', label: 'Image badge subtitle', placeholder: 'Spring 2025' },
    ],
  },
  {
    title: 'Ticker bar',
    fields: [
      {
        key: 'tickerText',
        label: 'Scrolling ticker text',
        placeholder: 'Free shipping • New arrivals • Easy returns •',
      },
    ],
  },
  {
    title: 'Products section',
    fields: [
      { key: 'productsEyebrow', label: 'Section eyebrow', placeholder: 'New Arrivals' },
      { key: 'productsTitle', label: 'Section title', placeholder: 'The Collection' },
      { key: 'productsCta', label: 'View all button', placeholder: 'View All Pieces' },
    ],
  },
  {
    title: 'Brand story',
    fields: [
      {
        key: 'brandStoryQuote',
        label: 'Quote',
        multiline: true,
        placeholder: 'Your brand philosophy…',
      },
    ],
  },
  {
    title: 'Lookbook',
    fields: [
      { key: 'lookbookEyebrow', label: 'Eyebrow', placeholder: 'Style Inspiration' },
      { key: 'lookbookTitle', label: 'Title', placeholder: 'Shop the Look' },
      { key: 'lookbookLinkLabel', label: 'Link label', placeholder: 'View All →' },
    ],
  },
  {
    title: 'Testimonials',
    fields: [
      { key: 'testimonialsEyebrow', label: 'Eyebrow', placeholder: 'Love Notes' },
      { key: 'testimonialsTitle', label: 'Title', placeholder: 'Our Community' },
    ],
  },
  {
    title: 'Newsletter',
    fields: [
      { key: 'newsletterEyebrow', label: 'Eyebrow', placeholder: 'Stay Connected' },
      { key: 'newsletterTitle', label: 'Title', placeholder: 'Always First' },
      { key: 'newsletterBody', label: 'Body text', multiline: true },
      { key: 'newsletterButton', label: 'Button label', placeholder: 'Join Us' },
      { key: 'newsletterPlaceholder', label: 'Email placeholder', placeholder: 'your@email.com' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      {
        key: 'footerSocialLinks',
        label: 'Social links (comma-separated)',
        placeholder: 'Instagram, Pinterest, TikTok',
      },
    ],
  },
];

const inputClass =
  'w-full rounded-xl text-sm outline-none px-3 py-2.5 transition-all duration-150 border border-[#2A2F3D] bg-[#1A1D28] text-[#F4F4F5] focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/20';

const labelClass = 'text-sm font-semibold text-[#B4C0D0]';

interface ClothingTemplateEditorProps {
  content: ClothingTemplateContent;
  onChange: (next: ClothingTemplateContent) => void;
  previewUrl?: string;
  dark?: boolean;
}

export function ClothingTemplateEditor({
  content,
  onChange,
  previewUrl,
  dark = true,
}: ClothingTemplateEditorProps) {
  const lookbookFields = useMemo(() => content.lookbookItems, [content.lookbookItems]);
  const testimonialFields = useMemo(() => content.testimonials, [content.testimonials]);

  const set = <K extends keyof ClothingTemplateContent>(
    key: K,
    value: ClothingTemplateContent[K],
  ) => onChange({ ...content, [key]: value });

  const cardBg = dark ? 'bg-[#12151E] border-[#2A2F3D]' : 'bg-white border-slate-200';

  return (
    <div className="flex flex-col gap-6">
      {previewUrl && (
        <div className={`rounded-xl border overflow-hidden ${cardBg}`}>
          <div className="px-4 py-3 border-b border-[#2A2F3D] flex items-center justify-between">
            <p className="text-sm font-bold text-[#F4F4F5]">Live preview</p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Open full page ↗
            </a>
          </div>
          <iframe
            title="Storefront preview"
            src={previewUrl}
            className="w-full bg-white"
            style={{ height: 420, border: 'none' }}
          />
        </div>
      )}

      {SECTIONS.map(section => (
        <div key={section.title} className={`rounded-xl border p-4 ${cardBg}`}>
          <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">{section.title}</h3>
          <div className="flex flex-col gap-4">
            {section.fields.map(field => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className={labelClass}>{field.label}</label>
                {field.multiline ? (
                  <textarea
                    rows={3}
                    value={String(content[field.key] ?? '')}
                    onChange={e => set(field.key, e.target.value as ClothingTemplateContent[typeof field.key])}
                    placeholder={field.placeholder}
                    className={`${inputClass} resize-none`}
                  />
                ) : (
                  <input
                    type="text"
                    value={String(content[field.key] ?? '')}
                    onChange={e => set(field.key, e.target.value as ClothingTemplateContent[typeof field.key])}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
                {field.key === 'heroImageUrl' && content.heroImageUrl && (
                  <div className="mt-1 rounded-xl overflow-hidden border border-[#2A2F3D] h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={content.heroImageUrl}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lookbook images */}
      <div className={`rounded-xl border p-4 ${cardBg}`}>
        <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">Lookbook images</h3>
        <div className="flex flex-col gap-4">
          {lookbookFields.map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[#1A1D28]">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Look {i + 1} title</label>
                <input
                  className={inputClass}
                  value={item.name}
                  onChange={e => {
                    const next = [...content.lookbookItems];
                    next[i] = { ...next[i], name: e.target.value };
                    set('lookbookItems', next);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Look {i + 1} image URL</label>
                <input
                  className={inputClass}
                  value={item.imageUrl}
                  onChange={e => {
                    const next = [...content.lookbookItems];
                    next[i] = { ...next[i], imageUrl: e.target.value };
                    set('lookbookItems', next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className={`rounded-xl border p-4 ${cardBg}`}>
        <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">Customer quotes</h3>
        <div className="flex flex-col gap-4">
          {testimonialFields.map((t, i) => (
            <div key={i} className="flex flex-col gap-3 p-3 rounded-lg bg-[#1A1D28]">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Quote {i + 1}</label>
                <textarea
                  rows={2}
                  className={`${inputClass} resize-none`}
                  value={t.quote}
                  onChange={e => {
                    const next = [...content.testimonials];
                    next[i] = { ...next[i], quote: e.target.value };
                    set('testimonials', next);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Customer name</label>
                <input
                  className={inputClass}
                  value={t.name}
                  onChange={e => {
                    const next = [...content.testimonials];
                    next[i] = { ...next[i], name: e.target.value };
                    set('testimonials', next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
