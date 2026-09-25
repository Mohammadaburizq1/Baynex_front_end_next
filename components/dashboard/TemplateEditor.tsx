'use client';

import { useMemo } from 'react';
import type { TemplateContent, TemplateContentItem, TemplateContentReview } from '@/lib/types/template-content';
import { getTemplateCategory, type TemplateCategory } from '@/lib/data/template-presets';

// ── Field / section schema ────────────────────────────────────────────────

type FieldKey = keyof TemplateContent;

interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  isUrl?: boolean;
}

interface SectionDef {
  title: string;
  fields: FieldDef[];
  /** Which categories show this section. 'all' means every category. */
  show: TemplateCategory[] | 'all';
}

const SECTIONS: SectionDef[] = [
  {
    title: 'Navigation',
    show: 'all',
    fields: [
      { key: 'navLinks', label: 'Nav links (comma-separated)', placeholder: 'Menu,About,Contact' },
    ],
  },
  {
    title: 'Hero section',
    show: 'all',
    fields: [
      { key: 'heroEyebrow', label: 'Eyebrow text', placeholder: 'Welcome to' },
      // non-clothing: single title
      { key: 'heroTitle', label: 'Headline', placeholder: 'Your Store Name' },
      // clothing: split title
      { key: 'heroTitleLine1', label: 'Headline line 1', placeholder: 'Dressed for the' },
      { key: 'heroTitleLine2', label: 'Headline line 2', placeholder: "moments you'll" },
      { key: 'heroTitleEmphasis', label: 'Headline accent (colour)', placeholder: 'remember forever' },
      {
        key: 'heroDescription',
        label: 'Tagline / description',
        placeholder: 'A short line about your brand…',
        multiline: true,
      },
      { key: 'heroImageUrl', label: 'Hero image URL', placeholder: 'https://…', isUrl: true },
      { key: 'primaryCta', label: 'Primary button', placeholder: 'Order Now' },
      { key: 'secondaryCta', label: 'Secondary button', placeholder: 'View Menu' },
      { key: 'heroBadgeLabel', label: 'Badge label', placeholder: 'NEW IN' },
      { key: 'heroBadgeSubtitle', label: 'Badge subtitle', placeholder: 'Spring 2025' },
    ],
  },
  // Opening hours are managed in Store Settings → Business Hours (M1-03).
  // Do not expose a free-text "Hours text" field here — it no longer affects live storefronts.
  {
    title: 'Featured card',
    show: ['restaurant'],
    fields: [
      { key: 'floatingCardName', label: 'Card title', placeholder: "Today's Special" },
      { key: 'floatingCardBlurb', label: 'Card subtitle', placeholder: "Chef's fresh pick" },
      { key: 'floatingCardImageUrl', label: 'Card image URL', placeholder: 'https://…', isUrl: true },
    ],
  },
  {
    title: 'Ticker bar',
    show: ['street-food', 'clothing'],
    fields: [
      {
        key: 'tickerText',
        label: 'Scrolling ticker text',
        placeholder: '🔥 FREE DELIVERY • ORDER NOW • FRESH DAILY •',
      },
    ],
  },
  {
    title: 'Products / menu section',
    show: 'all',
    fields: [
      { key: 'productsEyebrow', label: 'Section eyebrow', placeholder: 'Our Menu' },
      { key: 'productsTitle', label: 'Section title', placeholder: 'Popular Items' },
      { key: 'productsCta', label: 'View-all button', placeholder: 'View All' },
    ],
  },
  {
    title: 'Brand story',
    show: ['clothing', 'retail'],
    fields: [
      {
        key: 'brandStoryQuote',
        label: 'Brand quote',
        placeholder: 'Your brand philosophy in one great sentence…',
        multiline: true,
      },
    ],
  },
  {
    title: 'Lookbook',
    show: ['clothing'],
    fields: [
      { key: 'lookbookEyebrow', label: 'Eyebrow', placeholder: 'Style Inspiration' },
      { key: 'lookbookTitle', label: 'Title', placeholder: 'Shop the Look' },
      { key: 'lookbookLinkLabel', label: 'Link label', placeholder: 'View All →' },
    ],
  },
  {
    title: 'Testimonials',
    show: 'all',
    fields: [
      { key: 'testimonialsEyebrow', label: 'Eyebrow', placeholder: 'What People Say' },
      { key: 'testimonialsTitle', label: 'Title', placeholder: 'Customer Reviews' },
    ],
  },
  {
    title: 'Newsletter',
    show: ['restaurant', 'coffee', 'retail', 'services', 'clothing'],
    fields: [
      { key: 'newsletterEyebrow', label: 'Eyebrow', placeholder: 'Stay Connected' },
      { key: 'newsletterTitle', label: 'Title', placeholder: 'Get Our Latest Offers' },
      { key: 'newsletterBody', label: 'Body text', multiline: true },
      { key: 'newsletterButton', label: 'Button label', placeholder: 'Subscribe' },
      { key: 'newsletterPlaceholder', label: 'Email placeholder', placeholder: 'your@email.com' },
    ],
  },
  {
    title: 'Footer',
    show: 'all',
    fields: [
      {
        key: 'footerSocialLinks',
        label: 'Social links (comma-separated)',
        placeholder: 'Instagram,Facebook,TikTok',
      },
      { key: 'footerAbout', label: 'Footer tagline', placeholder: 'Your tagline here', multiline: true },
    ],
  },
];

// Fields that only show for specific categories
const CLOTHING_ONLY_FIELDS: FieldKey[] = [
  'heroTitleLine1', 'heroTitleLine2', 'heroTitleEmphasis', 'heroBadgeLabel', 'heroBadgeSubtitle',
];
const NON_CLOTHING_HIDE_FIELDS: FieldKey[] = [
  'heroTitleLine1', 'heroTitleLine2', 'heroTitleEmphasis',
];
// heroTitle is only for non-clothing
const CLOTHING_HIDE_FIELDS: FieldKey[] = ['heroTitle'];

// ── Styles ────────────────────────────────────────────────────────────────

const inputCls =
  'w-full rounded-xl text-sm outline-none px-3 py-2.5 transition-all duration-150 ' +
  'border border-[#2A2F3D] bg-[#1A1D28] text-[#F4F4F5] placeholder-[#4A5568] ' +
  'focus:border-[#818CF8] focus:ring-2 focus:ring-indigo-500/20';

const labelCls = 'text-sm font-semibold text-[#B4C0D0]';
const cardCls = 'rounded-xl border border-[#2A2F3D] bg-[#12151E] p-4';

// ── Component ─────────────────────────────────────────────────────────────

interface TemplateEditorProps {
  templateId: string;
  content: TemplateContent;
  onChange: (next: TemplateContent) => void;
}

export function TemplateEditor({ templateId, content, onChange }: TemplateEditorProps) {
  const category = useMemo(() => getTemplateCategory(templateId), [templateId]);
  const isClothing = category === 'clothing';

  const set = <K extends keyof TemplateContent>(key: K, value: TemplateContent[K]) =>
    onChange({ ...content, [key]: value });

  const visibleSections = SECTIONS.filter(s =>
    s.show === 'all' || s.show.includes(category),
  );

  function shouldShowField(key: FieldKey): boolean {
    if (isClothing && CLOTHING_HIDE_FIELDS.includes(key)) return false;
    if (!isClothing && NON_CLOTHING_HIDE_FIELDS.includes(key)) return false;
    return true;
  }

  return (
    <div className="flex flex-col gap-5">
      {visibleSections.map(section => {
        const visibleFields = section.fields.filter(f => shouldShowField(f.key));
        if (visibleFields.length === 0) return null;
        return (
          <div key={section.title} className={cardCls}>
            <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">{section.title}</h3>
            <div className="flex flex-col gap-4">
              {visibleFields.map(field => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className={labelCls}>{field.label}</label>
                  {field.multiline ? (
                    <textarea
                      rows={3}
                      value={String(content[field.key] ?? '')}
                      onChange={e => set(field.key, e.target.value as never)}
                      placeholder={field.placeholder}
                      className={`${inputCls} resize-none`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(content[field.key] ?? '')}
                      onChange={e => set(field.key, e.target.value as never)}
                      placeholder={field.placeholder}
                      className={inputCls}
                    />
                  )}
                  {field.isUrl && content[field.key] && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-[#2A2F3D] h-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={String(content[field.key])}
                        alt="Preview"
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
        );
      })}

      {/* Testimonials array */}
      <div className={cardCls}>
        <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">Customer quotes</h3>
        <div className="flex flex-col gap-4">
          {(content.testimonials ?? []).map((t: TemplateContentReview, i: number) => (
            <div key={i} className="flex flex-col gap-3 p-3 rounded-lg bg-[#1A1D28]">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Quote {i + 1}</label>
                <textarea
                  rows={2}
                  className={`${inputCls} resize-none`}
                  value={t.quote}
                  onChange={e => {
                    const next = [...(content.testimonials ?? [])];
                    next[i] = { ...next[i], quote: e.target.value };
                    set('testimonials', next);
                  }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Customer name</label>
                <input
                  className={inputCls}
                  value={t.name}
                  onChange={e => {
                    const next = [...(content.testimonials ?? [])];
                    next[i] = { ...next[i], name: e.target.value };
                    set('testimonials', next);
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lookbook images — clothing only */}
      {isClothing && (
        <div className={cardCls}>
          <h3 className="text-base font-extrabold text-[#F4F4F5] mb-4">Lookbook images</h3>
          <div className="flex flex-col gap-4">
            {(content.lookbookItems ?? []).map((item: TemplateContentItem, i: number) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[#1A1D28]">
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Look {i + 1} title</label>
                  <input
                    className={inputCls}
                    value={item.name}
                    onChange={e => {
                      const next = [...(content.lookbookItems ?? [])];
                      next[i] = { ...next[i], name: e.target.value };
                      set('lookbookItems', next);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Look {i + 1} image URL</label>
                  <input
                    className={inputCls}
                    value={item.imageUrl}
                    onChange={e => {
                      const next = [...(content.lookbookItems ?? [])];
                      next[i] = { ...next[i], imageUrl: e.target.value };
                      set('lookbookItems', next);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
