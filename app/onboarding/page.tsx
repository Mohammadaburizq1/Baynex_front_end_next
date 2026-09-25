'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Check, ChevronUp, ChevronDown, Play,
  MessageCircle, Lock, Eye, EyeOff,
  MapPin, Truck, Package, Clock, CalendarDays, Loader2,
  CheckCircle2, MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClothingTemplateEditor } from '@/components/dashboard/ClothingTemplateEditor';
import { TemplateEditor } from '@/components/dashboard/TemplateEditor';
import { defaultClothingContent, isClothingTemplateId } from '@/lib/data/clothing-presets';
import type { ClothingTemplateContent } from '@/lib/types/clothing-template-content';
import type { TemplateContent } from '@/lib/types/template-content';
import { initStoreData } from '@/lib/utils/store-scoped-data';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import {
  mergeClothingContent,
  saveTemplateContentForSlug,
  saveTemplateDraft,
} from '@/lib/utils/clothing-content';
import {
  mergeTemplateContent,
  saveDraft as saveNonClothingDraft,
  saveTemplateContent as saveNonClothingContent,
} from '@/lib/utils/template-content';

// ── Types ──────────────────────────────────────────────────────────────────────
type BusinessType = 'retail' | 'restaurant' | 'real_estate' | 'services' | 'catalog' | 'medical' | 'clothing';
type TemplateFilter =
  | 'all' | 'popular' | 'new' | 'cafe' | 'restaurant'
  | 'store' | 'services' | 'real_estate' | 'modern' | 'luxury' | 'medical' | 'clothing';
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

interface Template {
  id: string;
  name: string;
  description: string;
  businessType: BusinessType;
  tags: string[];
  gradient: [string, string];
  accentColor: string;
  isNew?: boolean;
  isPopular?: boolean;
}

// ── Template catalog ────────────────────────────────────────────────────────
const TEMPLATES: Template[] = [
  { id: 'restaurant-default', name: 'khanGates Restaurant', description: 'Cream landing with menu, cart, and delivery — our most popular start.', businessType: 'restaurant', tags: ['restaurant', 'popular', 'modern', 'arabic'], gradient: ['#FFF8F0', '#E8D5C4'], accentColor: '#92400E', isPopular: true },
  { id: 'retail-classic', name: 'Classic Store', description: 'Clean product grid for retail and general merchandise.', businessType: 'retail', tags: ['store', 'popular', 'modern'], gradient: ['#F5F5F5', '#64748B'], accentColor: '#475569', isPopular: true },
  { id: 'catalog-inquiry', name: 'Catalog & Inquiry', description: 'Showcase catalog with WhatsApp inquiry — no cart required.', businessType: 'catalog', tags: ['store', 'modern'], gradient: ['#1E293B', '#475569'], accentColor: '#6366F1' },
  { id: 'real-estate-skyline', name: 'Skyline Estate', description: 'Cinematic vertical feed for ultra-luxury penthouses and exclusive listings.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new', 'modern'], gradient: ['#0B0C10', '#1F2833'], accentColor: '#6366F1', isNew: true },
  { id: 'real-estate-prestige', name: 'Meridian Estates', description: 'Ultra-luxury prestige real estate — deep navy, platinum shimmer, gold accents, Spectral italic, editorial card grid.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new'], gradient: ['#080B18', '#C9A84C'], accentColor: '#C9A84C', isNew: true },
  { id: 'services-hub', name: 'Services Hub', description: 'Service grid with booking and contact options.', businessType: 'services', tags: ['services', 'modern'], gradient: ['#134E4A', '#0D9488'], accentColor: '#0D9488' },
  { id: 'services-serenity-spa', name: 'Serenity Spa', description: 'Calm wellness layout with service booking.', businessType: 'services', tags: ['services', 'luxury', 'new'], gradient: ['#0F1419', '#5B8A9A'], accentColor: '#5B8A9A', isNew: true },
  { id: 'retail-luxe-boutique', name: 'Luxe Boutique', description: 'Editorial luxury retail with bold typography.', businessType: 'retail', tags: ['store', 'luxury', 'new', 'modern'], gradient: ['#0D0D0D', '#8B7355'], accentColor: '#8B7355', isNew: true },
  { id: 'cafe', name: 'Classic Café', description: 'Warm tones and rich menu for a traditional café experience.', businessType: 'restaurant', tags: ['cafe', 'popular'], gradient: ['#1A1410', '#3D2914'], accentColor: '#92400E', isPopular: true },
  { id: 'coffee-cyber-brew', name: 'Cyber Brew', description: 'Neon cyberpunk coffee with sleek glass UI.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#0A0E1A', '#6366F1'], accentColor: '#6366F1', isNew: true },
  { id: 'coffee-green-leaf', name: 'Green Leaf', description: 'Organic eco coffee with calm, natural greens.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#0F1F14', '#2D6A4F'], accentColor: '#2D6A4F', isNew: true },
  { id: 'coffee-retro-groove', name: 'Retro Groove', description: 'Bold 70s vibes — warm cream, espresso dark hero, and orange-red energy.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#1C0A00', '#FF5533'], accentColor: '#FF5533', isNew: true },
  { id: 'coffee-blossom', name: 'Blossom Café', description: 'Soft Korean aesthetic — blush pink, clean white space, and a gentle rose accent.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new', 'luxury'], gradient: ['#F8D9E0', '#FCEEF2'], accentColor: '#C5607A', isNew: true },
  { id: 'coffee-neon-drip', name: 'Neon Drip', description: 'Cyberpunk late-night café — electric cyan & hot pink glows, glitch title, steam particles, neon cards.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#070710', '#00D9FF'], accentColor: '#00D9FF', isNew: true },
  { id: 'coffee-luxury-espresso', name: 'Noir & Gold', description: 'Ultra-dark luxury espresso bar — gold shimmer text, animated tasting-menu list, film grain, elegance.', businessType: 'restaurant', tags: ['cafe', 'luxury', 'new'], gradient: ['#080808', '#C9A84C'], accentColor: '#C9A84C', isNew: true },
  { id: 'coffee-aurora-brew', name: 'Aurora Brew', description: 'Northern lights café — animated aurora bands, floating particles, glass cards with aurora glow.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#020C18', '#00E5C8'], accentColor: '#00E5C8', isNew: true },
  { id: 'coffee-tropical-bloom', name: 'Tropical Bloom', description: 'Jungle-energy café — floating leaves, polaroid cards, vibrant coral & yellow palette.', businessType: 'restaurant', tags: ['cafe', 'modern', 'new'], gradient: ['#0B2A1D', '#FF6B35'], accentColor: '#FF6B35', isNew: true },
  { id: 'coffee-dark-academia', name: 'Dark Academia', description: 'Gothic library café — candlelight flicker, Cinzel serif, amber & parchment, aged journal cards.', businessType: 'restaurant', tags: ['cafe', 'luxury', 'new'], gradient: ['#120A05', '#C4962A'], accentColor: '#C4962A', isNew: true },
  { id: 'burger-restaurant', name: 'Smash House', description: 'Dark grill-bar energy — amber sparks, Anton bold type, full smash-burger menu with category filter.', businessType: 'restaurant', tags: ['restaurant', 'modern', 'new'], gradient: ['#080501', '#F59E0B'], accentColor: '#F59E0B', isNew: true },
  { id: 'dessert-shop', name: 'Sugar Atelier', description: 'Dreamy pastel patisserie — falling confetti, blob shapes, Fraunces italic, soft pink & lavender palette.', businessType: 'restaurant', tags: ['restaurant', 'luxury', 'new'], gradient: ['#FFF8F0', '#EC4899'], accentColor: '#EC4899', isNew: true },
  { id: 'ramen-shop', name: 'Ramen Night', description: 'Late-night Tokyo ramen bar — crimson red, steam particles, Source Serif italic, dark navy depth.', businessType: 'restaurant', tags: ['restaurant', 'modern', 'new'], gradient: ['#0C0B14', '#DC2626'], accentColor: '#DC2626', isNew: true },
  { id: 'mediterranean-restaurant', name: 'Agora Bistro', description: 'Warm Mediterranean bistro — terracotta, olive green, Lora serif, rustic warm cards.', businessType: 'restaurant', tags: ['restaurant', 'luxury', 'new'], gradient: ['#FAF3E8', '#C0562A'], accentColor: '#C0562A', isNew: true },
  { id: 'smoothie-bar', name: 'Pulse Bar', description: 'Vibrant health bar — morphing fruit blobs, vivid palette, Josefin bold caps, plant-powered energy.', businessType: 'restaurant', tags: ['restaurant', 'modern', 'new'], gradient: ['#F0FDF4', '#22C55E'], accentColor: '#22C55E', isNew: true },
  { id: 'korean-grille', name: 'Bulgogi House', description: 'K-BBQ live fire — magenta neon glow, Bebas Neue, floating ember particles, electric dark aesthetic.', businessType: 'restaurant', tags: ['restaurant', 'modern', 'new'], gradient: ['#0D0810', '#E91E8C'], accentColor: '#E91E8C', isNew: true },
  { id: 'french-brasserie', name: 'Maison Laurent', description: 'Parisian brasserie — dark hunter green, old gold fleur-de-lis, Baskerville italic, candlelight particles.', businessType: 'restaurant', tags: ['restaurant', 'luxury', 'new'], gradient: ['#111A14', '#D4AF37'], accentColor: '#D4AF37', isNew: true },
  { id: 'real-estate-agency', name: 'Vantage Properties', description: 'Full real estate agency page — company story, stats, agent team, services, property listings, and contact CTA. Warm ivory + forest green.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new'], gradient: ['#F9F6F0', '#2C4A3E'], accentColor: '#C8975A', isNew: true },
  { id: 'real-estate-corporate', name: 'Luminary Realty', description: 'Modern corporate agency page — split hero, testimonials, services grid, agent cards, property listings. White + deep navy + copper.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new', 'modern'], gradient: ['#F8F4EF', '#0E1E35'], accentColor: '#C07830', isNew: true },
  { id: 'real-estate-noir', name: 'Eclipse Estate', description: 'Dark luxury agency — obsidian black, antique gold particles, Cinzel caps, floating luminous particles, hover glow animations.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new'], gradient: ['#07090F', '#C9A87A'], accentColor: '#C9A87A', isNew: true },
  { id: 'real-estate-bold', name: 'Apex Realty', description: 'Bold geometric agency — diagonal hero, royal blue + vivid orange, Syne display, large bg numbers, slide-in card animations.', businessType: 'real_estate', tags: ['real_estate', 'modern', 'new'], gradient: ['#FAFAFA', '#1040C0'], accentColor: '#FF4D00', isNew: true },
  { id: 'real-estate-soleil', name: 'Soleil Estates', description: 'Mediterranean luxury agency — deep teal + sandy gold, Playfair italic serif, overlapping images, rotating testimonials.', businessType: 'real_estate', tags: ['real_estate', 'luxury', 'new'], gradient: ['#0D4F5C', '#D4A853'], accentColor: '#D4A853', isNew: true },
  { id: 'real-estate-axiom', name: 'Axiom Properties', description: 'Brutalist editorial agency — stark black + signal red, Anton display caps, b&w agent photos, newspaper grid layout.', businessType: 'real_estate', tags: ['real_estate', 'modern', 'new'], gradient: ['#0D0D0D', '#E62020'], accentColor: '#E62020', isNew: true },
  { id: 'services-meridian', name: 'Meridian Advisory', description: 'Professional consulting firm — forest green + copper, DM Serif italic display, offset-border image, 4-step process grid, testimonials.', businessType: 'services', tags: ['services', 'luxury', 'new'], gradient: ['#1B4332', '#C08B45'], accentColor: '#C08B45', isNew: true },
  { id: 'services-volt', name: 'Volt Studio', description: 'Bold creative agency — deep violet + electric neon green, animated orb bg, scan-line, ticker marquee, neon glow cards.', businessType: 'services', tags: ['services', 'modern', 'new'], gradient: ['#0F0720', '#A8FF00'], accentColor: '#A8FF00', isNew: true },
  { id: 'services-wellness', name: 'Aurora Wellness', description: 'Organic wellness studio — warm cream + terracotta + sage, Fraunces italic serif, floating hero, 4-step process, rotating testimonials.', businessType: 'services', tags: ['services', 'luxury', 'new'], gradient: ['#F8F4EE', '#C26845'], accentColor: '#C26845', isNew: true },
  { id: 'services-studio', name: 'Obsidian Studio', description: 'Dramatic photography studio — pure black + vivid red, Bebas Neue caps, full-screen hero, accordion services, gallery grid, process tiles.', businessType: 'services', tags: ['services', 'modern', 'new'], gradient: ['#080808', '#E8001C'], accentColor: '#E8001C', isNew: true },
  { id: 'medical-clinic', name: 'Vitalis Medical Centre', description: 'Professional medical clinic — deep navy + sky blue, Sora display, trust-pillar hero, services grid, doctor team, appointment CTA.', businessType: 'medical', tags: ['medical', 'modern', 'new'], gradient: ['#0D2450', '#2E86DE'], accentColor: '#2E86DE', isNew: true },
  { id: 'medical-pharmacy', name: 'PharmaPlus', description: 'Pharmacy & health store — emerald green, Plus Jakarta Sans, search hero, product grid with category filter, pharmacist team, delivery CTA.', businessType: 'medical', tags: ['medical', 'modern', 'new'], gradient: ['#004D33', '#00875A'], accentColor: '#00875A', isNew: true },
  { id: 'medical-premium', name: 'Lumiere Aesthetics', description: 'Premium aesthetic clinic — ivory + champagne gold, Cormorant Garamond italic, editorial hero, treatment grid with ghost numbers, luxury CTA.', businessType: 'medical', tags: ['medical', 'luxury', 'new'], gradient: ['#12100C', '#C4A35A'], accentColor: '#C4A35A', isNew: true },
  { id: 'clothing-editorial', name: 'Maison Noir', description: 'Luxury editorial fashion house — obsidian black + antique gold, Bodoni Moda italic, asymmetric collections grid, animated stats, rotating testimonials.', businessType: 'clothing', tags: ['clothing', 'luxury', 'new'], gradient: ['#0A0A0A', '#C4A55A'], accentColor: '#C4A55A', isNew: true },
  { id: 'clothing-streetwear', name: 'VOID DRIP', description: 'Underground streetwear brand — pure black + electric lime, Anton bold caps, drop culture, accordion drop schedule, brutalist about section.', businessType: 'clothing', tags: ['clothing', 'modern', 'new'], gradient: ['#0D0D0D', '#D4F500'], accentColor: '#D4F500', isNew: true },
  { id: 'clothing-boutique', name: 'Petal Studio', description: 'Soft luxury women\'s boutique — warm cream + blush rose, Playfair italic serif, floating blob hero, lookbook section, size selector cards.', businessType: 'clothing', tags: ['clothing', 'luxury', 'new'], gradient: ['#FBF8F5', '#9B7060'], accentColor: '#9B7060', isNew: true },
];


const FILTERS: TemplateFilter[] = [
  'all', 'popular', 'new', 'cafe', 'restaurant',
  'store', 'services', 'real_estate', 'medical', 'clothing', 'modern', 'luxury',
];
const FILTER_LABELS: Record<TemplateFilter, string> = {
  all: 'All', popular: 'Popular', new: 'New', cafe: 'Café',
  restaurant: 'Restaurant', store: 'Store', services: 'Services',
  real_estate: 'Real Estate', medical: 'Medical', clothing: 'Clothing', modern: 'Modern', luxury: 'Luxury',
};

const STEP_LABELS = ['Contact & Account', 'Choose Design', 'Business Details', 'Customize'];
const LAST_STEP = 3;

const STORE_NAME_LABELS: Record<BusinessType, string> = {
  retail: 'Store Name', restaurant: 'Restaurant Name',
  real_estate: 'Agency Name', services: 'Business Name', catalog: 'Business Name',
  medical: 'Clinic / Pharmacy Name',
  clothing: 'Brand / Store Name',
};

// ── Slug helpers ────────────────────────────────────────────────────────────
const TAKEN_SLUGS = new Set(['demo-store', 'shoplink', 'test', 'admin', 'app', 'store']);

const checkSlug = async (slug: string): Promise<SlugStatus> => {
  if (!slug || slug.length < 3) return 'invalid';
  if (!/^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/.test(slug)) return 'invalid';
  await new Promise(r => setTimeout(r, 650));
  return TAKEN_SLUGS.has(slug) ? 'taken' : 'available';
};

const toSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

const isValidPhone = (phone: string) =>
  /^\+?[0-9\s\-()]{9,16}$/.test(phone.trim());

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ step, lastStep }: { step: number; lastStep: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: lastStep + 1 }, (_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full overflow-hidden transition-all duration-300"
          style={{ background: '#2A2F3D' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: i <= step ? '100%' : '0%',
              background: i <= step
                ? 'linear-gradient(90deg, #6366F1, #8B5CF6)'
                : 'transparent',
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Step pills ─────────────────────────────────────────────────────────────
function StepPills({ currentStep, labels }: { currentStep: number; labels: string[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {labels.map((label, i) => {
        const active = i === currentStep;
        const done = i < currentStep;
        return (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full shrink-0 transition-all duration-200"
            style={{
              background: active ? 'rgba(99,102,241,0.20)' : '#1A1D28',
              border: `1px solid ${(active || done) ? '#818CF8' : '#2A2F3D'}`,
            }}
          >
            {done ? (
              <Check size={13} style={{ color: '#818CF8' }} />
            ) : (
              <span
                className="text-xs font-extrabold w-3.5 text-center"
                style={{ color: active ? '#818CF8' : '#B4C0D0' }}
              >
                {i + 1}
              </span>
            )}
            <span
              className="text-[13px] font-semibold"
              style={{
                fontWeight: active ? 700 : 500,
                color: (active || done) ? '#F4F4F5' : '#B4C0D0',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Dark input ─────────────────────────────────────────────────────────────
function DarkInput({
  label, value, onChange, placeholder, type = 'text',
  prefix: PrefixIcon, suffix, hint, error, disabled,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
  prefix?: React.ElementType; suffix?: React.ReactNode;
  hint?: string; error?: string; disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: '#B4C0D0' }}>{label}</label>
      <div className="relative flex items-center">
        {PrefixIcon && (
          <span className="absolute left-3.5 pointer-events-none" style={{ color: '#B4C0D0' }}>
            <PrefixIcon size={16} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-11 rounded-xl text-sm outline-none transition-all duration-150 disabled:opacity-50"
          style={{
            background: '#1A1D28',
            border: `1px solid ${error ? '#EF4444' : '#2A2F3D'}`,
            color: '#F4F4F5',
            padding: PrefixIcon ? '0 12px 0 36px' : '0 12px',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = error ? '#EF4444' : '#818CF8';
            e.currentTarget.style.boxShadow = `0 0 0 2px ${error ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.2)'}`;
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = error ? '#EF4444' : '#2A2F3D';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {suffix && (
          <span className="absolute right-3 flex items-center">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs" style={{ color: '#EF4444' }}>{error}</p>}
      {!error && hint && <p className="text-xs" style={{ color: '#B4C0D0' }}>{hint}</p>}
    </div>
  );
}

// ── Dark toggle ─────────────────────────────────────────────────────────────
function DarkToggle({ checked, onChange, label, subtitle }: {
  checked: boolean; onChange: (v: boolean) => void;
  label: string; subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#2A2F3D' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#F4F4F5' }}>{label}</p>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: '#B4C0D0' }}>{subtitle}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none shrink-0 cursor-pointer"
        style={{ background: checked ? '#6366F1' : '#2A2F3D' }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(4px)' }}
        />
      </button>
    </div>
  );
}

// ── Template gallery ───────────────────────────────────────────────────────
function TemplateGalleryStep({
  selectedId, onSelect, searchQuery, onSearchChange,
  activeFilter, onFilterChange, filtered, pageItems,
  pageIndex, totalPages, onGoPage,
}: {
  selectedId: string | null; onSelect: (id: string) => void;
  searchQuery: string; onSearchChange: (q: string) => void;
  activeFilter: TemplateFilter; onFilterChange: (f: TemplateFilter) => void;
  filtered: Template[]; pageItems: Template[];
  pageIndex: number; totalPages: number;
  onGoPage: (next: number, forward: boolean) => void;
}) {
  const selected = TEMPLATES.find(t => t.id === selectedId) ?? null;

  return (
    <div>
      <h2 className="text-[26px] font-extrabold leading-tight mb-2" style={{ color: '#F4F4F5', letterSpacing: '-0.5px' }}>
        Choose Your Storefront Design
      </h2>
      <p className="text-[15px] mb-5" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
        Pick a template that fits your business. You can customize everything later.
      </p>

      {/* Selection status bar */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-5 border transition-all duration-200"
        style={{
          background: selected ? 'rgba(99,102,241,0.18)' : '#232836',
          borderColor: selected ? '#818CF8' : '#3D4556',
        }}
      >
        {selected
          ? <CheckCircle2 size={22} style={{ color: '#22C55E', flexShrink: 0 }} />
          : <MousePointerClick size={22} style={{ color: '#B4C0D0', flexShrink: 0 }} />
        }
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide mb-0.5" style={{ color: '#B4C0D0' }}>
            {selected ? 'SELECTED' : 'TAP A CARD TO SELECT'}
          </p>
          <p className="text-base font-extrabold truncate" style={{ color: '#F4F4F5' }}>
            {selected ? selected.name : '—'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#B4C0D0' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search templates..."
          className="w-full h-11 rounded-xl text-sm outline-none pl-10 pr-4"
          style={{ background: '#1A1D28', border: '1px solid #2A2F3D', color: '#F4F4F5' }}
          onFocus={e => { e.currentTarget.style.borderColor = '#818CF8'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#2A2F3D'; }}
        />
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-bold" style={{ color: '#F4F4F5' }}>Filter by type</p>
        <p className="text-sm" style={{ color: '#B4C0D0' }}>{filtered.length} template{filtered.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all duration-150 cursor-pointer min-h-[40px]"
              style={{
                background: active ? '#6366F1' : '#232836',
                border: `${active ? 2 : 1}px solid ${active ? '#A5B4FC' : '#3D4556'}`,
                color: active ? '#FFFFFF' : '#F4F4F5',
              }}
            >
              {active && <Check size={16} />}
              {FILTER_LABELS[f]}
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      <div className="mb-4">
        {pageItems.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm" style={{ color: '#B4C0D0' }}>No templates match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {pageItems.map(t => (
              <TemplateCard
                key={t.id}
                template={t}
                selected={selectedId === t.id}
                onSelect={() => onSelect(t.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center rounded-[14px] border overflow-hidden"
          style={{ background: '#1A1D28', borderColor: '#2A2F3D' }}
        >
          <button
            onClick={() => onGoPage(pageIndex - 1, false)}
            disabled={pageIndex === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: '#818CF8' }}
          >
            <ChevronUp size={18} />
            Previous
          </button>
          <span
            className="flex-1 text-center text-sm font-bold"
            style={{ color: '#E2E8F0' }}
          >
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            onClick={() => onGoPage(pageIndex + 1, true)}
            disabled={pageIndex >= totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
            style={{ background: pageIndex < totalPages - 1 ? '#6366F1' : 'transparent', color: pageIndex < totalPages - 1 ? '#fff' : '#818CF8' }}
          >
            More
            <ChevronDown size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Template card ──────────────────────────────────────────────────────────
function TemplatePreviewMockup({ id, accent }: { id: string; accent: string }) {
  const a = (op: number) => accent + Math.round(op * 255).toString(16).padStart(2, '0');
  const row = (w: number, op: number) => (
    <div style={{ height: 3, borderRadius: 2, background: a(op), width: w }} />
  );

  switch (id) {
    case 'restaurant-default':
      return (
        <div style={{ width: '100%', height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 5, borderRadius: 4, background: a(0.45), width: '60%' }} />
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 8, background: a(0.2 + i * 0.06), display: 'flex', alignItems: 'flex-end', padding: '0 6px 7px' }}>
                <div style={{ height: 3, width: '80%', borderRadius: 2, background: a(0.45) }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>{row(48, 0.35)}{row(32, 0.2)}</div>
        </div>
      );

    case 'retail-classic':
      return (
        <div style={{ width: '100%', height: '100%', padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ borderRadius: 8, background: a(0.18 + i * 0.04), border: `1px solid ${a(0.2)}` }} />
          ))}
        </div>
      );

    case 'catalog-inquiry':
      return (
        <div style={{ width: '100%', height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9, justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, background: a(0.22), flexShrink: 0 }} />
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: a(0.25) }} />
              <div style={{ width: 24, height: 3, borderRadius: 2, background: a(0.45) }} />
            </div>
          ))}
          <div style={{ height: 18, borderRadius: 6, background: a(0.3), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: 3, width: 44, borderRadius: 2, background: a(0.65) }} />
          </div>
        </div>
      );

    case 'real-estate-skyline':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
          {[0,1].map(i => (
            <div key={i} style={{ height: 38, borderRadius: 8, background: a(0.16 + i * 0.1), display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8 }}>
              <div style={{ height: 5, width: 44, borderRadius: 3, background: a(0.55) }} />
              <div style={{ flex: 1, height: 2, borderRadius: 2, background: a(0.2) }} />
              <div style={{ width: 26, height: 14, borderRadius: 4, background: a(0.4) }} />
            </div>
          ))}
        </div>
      );

    case 'real-estate-prestige':
      return (
        <div style={{ width: '100%', height: '100%', background: '#080B18', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Gold ornament + shimmer title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, border: '1px solid #C9A84C', transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div style={{ height: 5, borderRadius: 1, background: 'linear-gradient(90deg, #C9A84C, #E8D090, #C9A84C)', width: '55%' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #C9A84C44, transparent)' }} />
          </div>
          {/* Gold rule */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, #C9A84C, #B8942C44, transparent)', width: '70%' }} />
          {/* Category underline tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2,3].map((_,i) => (
              <div key={i} style={{ height: 6, width: i === 0 ? 20 : 14, borderBottom: `1px solid ${i === 0 ? '#C9A84C' : '#1E2A3C'}`, paddingBottom: 2 }} />
            ))}
          </div>
          {/* Property cards — 2 col */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[0,1].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 2, background: '#0F1525', border: `1px solid ${i === 0 ? '#C9A84C55' : '#1E2A3C'}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Image area */}
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #0F1A2E, #162030)', position: 'relative' }}>
                  {/* Status badge */}
                  <div style={{ position: 'absolute', top: 3, left: 3, width: 16, height: 4, borderRadius: 0, background: '#6EE7B722', border: '1px solid #6EE7B744' }} />
                </div>
                {/* Price + detail */}
                <div style={{ padding: '4px 5px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 4, width: '70%', borderRadius: 1, background: '#C9A84CAA' }} />
                  <div style={{ height: 2, width: '50%', borderRadius: 1, background: '#1E2A3C' }} />
                  {/* Specs row */}
                  <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
                    {[0,1,2].map(j => <div key={j} style={{ height: 2, width: 10, borderRadius: 1, background: '#1E2A3C' }} />)}
                  </div>
                  {/* CTA */}
                  <div style={{ height: 5, borderRadius: 1, border: '1px solid #C9A84C44', marginTop: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'real-estate-corporate':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F8F4EF', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Split hero: text left, image right */}
          <div style={{ display: 'flex', flex: 1.2 }}>
            <div style={{ flex: 1, background: '#F3EDE4', padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 14, height: 3, background: '#C07830' }} />
                <div style={{ height: 3, width: '40%', borderRadius: 1, background: '#C0783066' }} />
              </div>
              <div style={{ height: 10, width: '85%', borderRadius: 1, background: '#0E1E35', opacity: 0.85 }} />
              <div style={{ height: 4, width: '65%', borderRadius: 1, background: '#0E1E3544' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                <div style={{ height: 8, width: 28, background: '#0E1E35' }} />
                <div style={{ height: 8, width: 28, border: '1px solid #CBD2DC' }} />
              </div>
            </div>
            <div style={{ flex: 1, background: '#2A3D52', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 6, left: 6, height: 10, width: 36, background: 'rgba(14,30,53,0.75)', display: 'flex', alignItems: 'center', paddingLeft: 4, gap: 3 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ADE80' }} />
                <div style={{ height: 2, flex: 1, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }} />
              </div>
            </div>
          </div>
          {/* Stats band */}
          <div style={{ background: '#0E1E35', padding: '5px 10px', display: 'flex', justifyContent: 'space-around' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 6, width: 18, borderRadius: 1, background: '#C07830', marginBottom: 2 }} />
                <div style={{ height: 2, width: 22, borderRadius: 1, background: 'rgba(255,255,255,0.2)' }} />
              </div>
            ))}
          </div>
          {/* Property cards */}
          <div style={{ padding: '6px 8px', display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, border: '1px solid #E4DDD3', background: '#fff', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: 18, background: '#C07830' + (i === 0 ? '55' : '25') }} />
                <div style={{ padding: '3px 4px' }}>
                  <div style={{ height: 4, width: '60%', borderRadius: 1, background: '#0E1E3577', marginBottom: 2 }} />
                  <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#E4DDD3' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'real-estate-agency':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F9F6F0', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
          {/* Dark hero strip */}
          <div style={{ background: '#1C2028', borderRadius: 4, padding: '5px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ height: 3, width: '40%', borderRadius: 1, background: '#C8975A88' }} />
            <div style={{ height: 5, width: '65%', borderRadius: 1, background: '#fff' }} />
            <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
              <div style={{ height: 5, width: 22, border: '1px solid rgba(255,255,255,0.3)', borderRadius: 1 }} />
              <div style={{ height: 5, width: 22, border: '1px solid #C8975A', borderRadius: 1 }} />
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <div style={{ height: 6, width: '60%', borderRadius: 1, background: '#C8975A' }} />
                <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#E6DDD4' }} />
              </div>
            ))}
          </div>
          {/* Agent + property mini cards */}
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {[0,1].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 3, background: '#fff', border: '1px solid #E6DDD4', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: '#2C4A3E22' }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '70%', borderRadius: 1, background: '#2C4A3E' }} />
                  <div style={{ height: 2, width: '50%', borderRadius: 1, background: '#E6DDD4' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'real-estate-noir':
      return (
        <div style={{ width: '100%', height: '100%', background: '#07090F', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Particles */}
          {[15,40,65,85,30,72].map((x,i) => (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${[20,50,35,70,15,60][i]}%`, width: 3, height: 3, borderRadius: '50%', background: '#C9A87A', opacity: 0.6 }} />
          ))}
          {/* Nav */}
          <div style={{ padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(201,168,122,0.12)' }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, background: 'transparent', border: '1px solid #C9A87A', transform: 'rotate(45deg)' }} />
              <div style={{ height: 3, width: 22, borderRadius: 1, background: '#C9A87A66' }} />
            </div>
            <div style={{ height: 5, width: 16, background: '#C9A87A' }} />
          </div>
          {/* Hero */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '6px 10px' }}>
            <div style={{ height: 3, width: 30, borderRadius: 1, background: '#C9A87A55' }} />
            <div style={{ height: 9, width: '70%', borderRadius: 1, background: '#fff', opacity: 0.9 }} />
            <div style={{ height: 3, width: '55%', borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
              <div style={{ height: 7, width: 22, border: '1px solid #C9A87A', background: 'transparent' }} />
              <div style={{ height: 7, width: 22, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent' }} />
            </div>
          </div>
          {/* Property cards row */}
          <div style={{ padding: '4px 8px 8px', display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, background: '#0E1220', border: '1px solid rgba(201,168,122,0.2)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: 14, background: `rgba(201,168,122,${0.1 + i * 0.05})` }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <div style={{ height: 3, width: '65%', borderRadius: 1, background: '#C9A87A' }} />
                  <div style={{ height: 2, width: '80%', borderRadius: 1, background: 'rgba(255,255,255,0.12)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'real-estate-soleil':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FEFCF8', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Split hero */}
          <div style={{ display: 'flex', flex: 1.4 }}>
            {/* Left: deep teal */}
            <div style={{ flex: 1, background: '#0D4F5C', padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, position: 'relative', overflow: 'hidden' }}>
              {/* circle ornament */}
              <div style={{ position: 'absolute', bottom: -16, right: -16, width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(212,168,83,0.15)' }} />
              <div style={{ height: 2, width: 20, background: '#D4A853', marginBottom: 2 }} />
              <div style={{ height: 9, width: '80%', borderRadius: 1, background: 'rgba(254,252,248,0.9)' }} />
              <div style={{ height: 3, width: '60%', borderRadius: 1, background: 'rgba(254,252,248,0.3)' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <div style={{ height: 7, width: 24, background: '#D4A853', borderRadius: 1 }} />
                <div style={{ height: 7, width: 24, border: '1px solid rgba(254,252,248,0.25)', borderRadius: 1 }} />
              </div>
            </div>
            {/* Right: photo */}
            <div style={{ flex: 1, background: '#2A6070', position: 'relative' }}>
              {/* floating pill */}
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: '#fff', padding: '4px 8px', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#D4A853' }} />
                <div style={{ height: 4, width: 18, borderRadius: 1, background: '#0D4F5C' }} />
              </div>
            </div>
          </div>
          {/* Gold top-border stats */}
          <div style={{ background: '#F5EDDE', borderTop: '3px solid #D4A853', padding: '4px 8px', display: 'flex', justifyContent: 'space-around' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 6, width: 18, borderRadius: 1, background: '#0D4F5C', marginBottom: 2 }} />
                <div style={{ height: 2, width: 24, borderRadius: 1, background: '#DDD5C4' }} />
              </div>
            ))}
          </div>
          {/* Property cards */}
          <div style={{ padding: '5px 8px 8px', display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, border: '1px solid #DDD5C4', borderRadius: 3, overflow: 'hidden', background: '#fff' }}>
                <div style={{ height: 16, background: i === 0 ? '#0D4F5C33' : '#F5EDDE' }} />
                <div style={{ padding: '3px 4px' }}>
                  <div style={{ height: 4, width: '55%', borderRadius: 1, background: '#0D4F5C', marginBottom: 2 }} />
                  <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#DDD5C4' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'real-estate-axiom':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAFAFA', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Black nav */}
          <div style={{ background: '#0D0D0D', padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ height: 5, width: 36, borderRadius: 1, background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ height: 6, width: 18, background: '#E62020' }} />
          </div>
          {/* Big hero heading */}
          <div style={{ padding: '12px 10px 6px', flex: 1 }}>
            <div style={{ height: 4, width: 28, background: '#E62020', marginBottom: 6 }} />
            <div style={{ height: 18, width: '90%', borderRadius: 1, background: '#0D0D0D', marginBottom: 2 }} />
            <div style={{ height: 18, width: '60%', borderRadius: 1, background: '#E62020', marginBottom: 6 }} />
            <div style={{ height: 3, background: '#0D0D0D', marginBottom: 6 }} />
            <div style={{ height: 3, width: '55%', borderRadius: 1, background: '#ccc', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 4 }}>
              <div style={{ height: 8, width: 28, background: '#E62020' }} />
              <div style={{ height: 8, width: 28, background: '#0D0D0D' }} />
            </div>
          </div>
          {/* Image strip */}
          <div style={{ height: 28, background: '#555', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #FAFAFA 0%, transparent 20%, transparent 80%, #FAFAFA 100%)' }} />
            <div style={{ position: 'absolute', left: '50%', bottom: 4, transform: 'translateX(-50%)', background: '#0D0D0D', padding: '2px 12px', display: 'flex', gap: 8, alignItems: 'center', whiteSpace: 'nowrap' }}>
              {[0,1,2].map(i => <div key={i} style={{ height: 4, width: 20, borderRadius: 1, background: '#E62020' }} />)}
            </div>
          </div>
        </div>
      );

    case 'real-estate-bold':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAFAFA', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Split hero */}
          <div style={{ display: 'flex', flex: 1.4 }}>
            {/* Left: dark with diagonal */}
            <div style={{ flex: 1, background: '#0A0A0A', padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, clipPath: 'polygon(0 0,100% 0,88% 100%,0 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontSize: 36, fontWeight: 900, color: 'rgba(255,255,255,0.04)', lineHeight: 1 }}>A</div>
              <div style={{ height: 5, width: 18, background: '#FF4D00' }} />
              <div style={{ height: 8, width: '70%', borderRadius: 1, background: '#fff' }} />
              <div style={{ height: 3, width: '55%', borderRadius: 1, background: 'rgba(255,255,255,0.35)' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                <div style={{ height: 7, width: 22, background: '#FF4D00' }} />
                <div style={{ height: 7, width: 22, background: '#1040C0' }} />
              </div>
            </div>
            {/* Right: photo */}
            <div style={{ flex: 1, background: '#2A3D5A' }} />
          </div>
          {/* Blue stats band */}
          <div style={{ background: '#1040C0', padding: '4px 8px', display: 'flex', justifyContent: 'space-around' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 5, width: 16, borderRadius: 1, background: '#fff', marginBottom: 1, opacity: 0.9 }} />
                <div style={{ height: 2, width: 20, borderRadius: 1, background: 'rgba(255,255,255,0.3)' }} />
              </div>
            ))}
          </div>
          {/* Property cards */}
          <div style={{ padding: '5px 8px', display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, border: `2px solid ${i === 0 ? '#1040C0' : '#E0E4F0'}`, background: '#fff', overflow: 'hidden', borderRadius: 2 }}>
                <div style={{ height: 14, background: i === 0 ? '#1040C033' : '#F0F0F0' }} />
                <div style={{ padding: '3px 4px' }}>
                  <div style={{ height: 4, width: '55%', borderRadius: 1, background: '#1040C0', marginBottom: 2 }} />
                  <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#E0E4F0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-meridian':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAFAF5', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Split hero: green left, stats right */}
          <div style={{ display: 'flex', flex: 1.5 }}>
            <div style={{ flex: 1, background: '#1B4332', padding: '10px 10px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
              <div style={{ height: 2, width: 16, background: '#C08B45', marginBottom: 2 }} />
              <div style={{ height: 9, width: '80%', borderRadius: 1, background: 'rgba(250,250,245,0.9)' }} />
              <div style={{ height: 5, width: '55%', borderRadius: 1, background: 'rgba(250,250,245,0.3)' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 3 }}>
                <div style={{ height: 7, width: 22, background: '#C08B45', borderRadius: 1 }} />
                <div style={{ height: 7, width: 22, border: '1px solid rgba(250,250,245,0.2)', borderRadius: 1 }} />
              </div>
            </div>
            {/* Stats grid right */}
            <div style={{ flex: 1, background: '#F3EFE4', padding: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ background: '#FAFAF5', border: '1px solid #DDD8CC', borderRadius: 2, padding: '5px 6px' }}>
                  <div style={{ height: 6, width: '60%', borderRadius: 1, background: '#1B4332', marginBottom: 3 }} />
                  <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#DDD8CC' }} />
                </div>
              ))}
            </div>
          </div>
          {/* Service cards */}
          <div style={{ padding: '5px 8px 8px', display: 'flex', gap: 5 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, border: '1px solid #DDD8CC', background: '#fff', borderRadius: 2, padding: '5px 6px' }}>
                <div style={{ height: 3, width: '40%', borderRadius: 1, background: '#C08B45', marginBottom: 3 }} />
                <div style={{ height: 5, width: '70%', borderRadius: 1, background: '#1B4332', marginBottom: 2 }} />
                <div style={{ height: 2, width: '90%', borderRadius: 1, background: '#F3EFE4' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-volt':
      return (
        <div style={{ width: '100%', height: '100%', background: '#0F0720', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Orb blobs */}
          {[{x:15,y:20},{x:70,y:50},{x:40,y:80}].map((o,i) => (
            <div key={i} style={{ position: 'absolute', left: `${o.x}%`, top: `${o.y}%`, width: 50, height: 50, borderRadius: '50%', background: i === 0 ? '#A8FF00' : '#7C3AED', opacity: 0.08, filter: 'blur(12px)', transform: 'translate(-50%,-50%)' }} />
          ))}
          {/* Nav */}
          <div style={{ padding: '5px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(168,255,0,0.1)', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 14, background: '#A8FF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 5, height: 5, background: '#0F0720' }} />
              </div>
              <div style={{ height: 4, width: 24, borderRadius: 1, background: 'rgba(244,240,255,0.6)' }} />
            </div>
            <div style={{ height: 6, width: 18, background: '#A8FF00' }} />
          </div>
          {/* Hero */}
          <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, zIndex: 1 }}>
            <div style={{ height: 10, width: '85%', borderRadius: 1, background: 'rgba(244,240,255,0.85)' }} />
            <div style={{ height: 10, width: '60%', borderRadius: 1, background: '#A8FF00', boxShadow: '0 0 10px rgba(168,255,0,0.3)' }} />
            <div style={{ height: 3, width: '55%', borderRadius: 1, background: 'rgba(244,240,255,0.25)', marginTop: 2 }} />
            <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
              <div style={{ height: 7, width: 22, background: '#A8FF00' }} />
              <div style={{ height: 7, width: 22, border: '1px solid rgba(244,240,255,0.2)' }} />
            </div>
          </div>
          {/* Ticker strip */}
          <div style={{ background: '#1A0F35', borderTop: '1px solid rgba(168,255,0,0.1)', padding: '3px 8px', display: 'flex', gap: 10 }}>
            {[0,1,2,3,4].map(i => <div key={i} style={{ height: 3, width: 18, borderRadius: 1, background: 'rgba(244,240,255,0.2)' }} />)}
          </div>
          {/* Service cards */}
          <div style={{ padding: '5px 8px 8px', display: 'flex', gap: 4, zIndex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(168,255,0,0.12)', padding: '4px 5px', borderRadius: 2 }}>
                <div style={{ height: 2, width: '50%', borderRadius: 1, background: '#A8FF00', marginBottom: 3 }} />
                <div style={{ height: 4, width: '80%', borderRadius: 1, background: 'rgba(244,240,255,0.6)', marginBottom: 2 }} />
                <div style={{ height: 2, width: '90%', borderRadius: 1, background: 'rgba(244,240,255,0.1)' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-hub':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          {row(48, 0.45)}
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 10, background: a(0.18), border: `1px solid ${a(0.28)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: a(0.5) }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-serenity-spa':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${a(0.55)}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: a(0.3) }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            {[56, 40, 48].map((w, i) => <div key={i} style={{ height: 2, width: w, borderRadius: 2, background: a(0.3) }} />)}
          </div>
        </div>
      );

    case 'retail-luxe-boutique':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'flex-end' }}>
          <div style={{ flex: 1, borderRadius: 8, background: a(0.12), border: `1px solid ${a(0.22)}` }} />
          <div style={{ height: 6, borderRadius: 3, background: a(0.75), width: '72%' }} />
          {row(44, 0.3)}
          <div style={{ height: 16, borderRadius: 6, background: a(0.3), width: '38%' }} />
        </div>
      );

    case 'cafe':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
          <div style={{ alignSelf: 'center', width: 30, height: 30, borderRadius: '50%', border: `2px solid ${a(0.6)}`, marginBottom: 4 }} />
          {[0,1,2].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ height: 3, width: 48 - i * 8, borderRadius: 2, background: a(0.45), flexShrink: 0 }} />
              <div style={{ flex: 1, height: 1, borderRadius: 2, background: a(0.15) }} />
              <div style={{ height: 3, width: 18, borderRadius: 2, background: a(0.55) }} />
            </div>
          ))}
        </div>
      );

    case 'coffee-cyber-brew':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 22, height: 30, borderRadius: '4px 4px 8px 8px', background: a(0.18), border: `1px solid ${a(0.55)}`, boxShadow: `0 0 8px ${a(0.3)}` }} />
                <div style={{ width: 8, height: 4, borderRadius: 2, background: a(0.45) }} />
              </div>
            ))}
          </div>
          <div style={{ width: '80%', height: 2, borderRadius: 2, background: a(0.35), boxShadow: `0 0 6px ${a(0.5)}` }} />
        </div>
      );

    case 'coffee-green-leaf':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, height: 50, borderRadius: 14, background: a(0.18 + i * 0.07), border: `1px solid ${a(0.28)}`, display: 'flex', alignItems: 'flex-end', padding: '0 6px 7px' }}>
                <div style={{ height: 3, width: '75%', borderRadius: 2, background: a(0.45) }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: a(0.65) }} />
            <div style={{ height: 2, flex: 1, borderRadius: 2, background: a(0.22) }} />
          </div>
        </div>
      );

    case 'coffee-retro-groove':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2px solid ${a(0.6)}`, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ height: 3, width: 20, borderRadius: 2, background: a(0.65) }} />
            <div style={{ height: 2, width: 14, borderRadius: 2, background: a(0.4) }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ height: 3, flex: 1, borderRadius: 2, background: a(0.3 + i * 0.1) }} />
                <div style={{ height: 3, width: 18, borderRadius: 2, background: a(0.55) }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'coffee-blossom':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0,1].map(i => (
              <div key={i} style={{ flex: 1, height: 54, borderRadius: 18, background: a(0.25 + i * 0.12), border: `1px solid ${a(0.38)}`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 8, gap: 4 }}>
                <div style={{ height: 3, width: '70%', borderRadius: 2, background: a(0.65) }} />
                <div style={{ height: 2, width: '50%', borderRadius: 2, background: a(0.38) }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: a(i === 0 ? 0.75 : 0.3) }} />)}
          </div>
        </div>
      );

    case 'coffee-neon-drip':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
          <div style={{ height: 2, borderRadius: 2, background: accent, boxShadow: `0 0 8px ${accent}` }} />
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: `1px solid ${i % 2 === 0 ? accent + '60' : '#FF3CAC55'}`, boxShadow: i === 0 ? `0 0 8px ${accent}30` : 'none' }} />
            ))}
          </div>
          <div style={{ height: 2, borderRadius: 2, background: '#FF3CAC', boxShadow: '0 0 8px rgba(255,60,172,0.8)' }} />
        </div>
      );

    case 'coffee-luxury-espresso':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
          {[0,1,2].map(i => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 7 }}>
                <div style={{ height: 3, width: 14, borderRadius: 2, background: a(0.45), flexShrink: 0 }} />
                <div style={{ height: 2, flex: 1, borderRadius: 2, background: a(0.18) }} />
                <div style={{ height: 3, width: 22, borderRadius: 2, background: a(0.65) }} />
              </div>
              {i < 2 && <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${a(0.22)}, transparent)` }} />}
            </div>
          ))}
        </div>
      );

    case 'coffee-aurora-brew':
      return (
        <div style={{ width: '100%', height: '100%', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'flex-end' }}>
            {['rgba(0,229,200,0.28)', 'rgba(167,139,250,0.22)', 'rgba(0,191,255,0.18)'].map((clr, i) => (
              <div key={i} style={{ height: 8 + i * 2, borderRadius: 100, background: clr, filter: 'blur(4px)', width: `${65 + i * 12}%` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${a(0.28 + i * 0.1)}` }} />
            ))}
          </div>
        </div>
      );

    case 'coffee-tropical-bloom':
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {[
            { bg: '#FF6B35', rotate: '-8deg' },
            { bg: '#FFD93D', rotate: '4deg' },
            { bg: '#2EC4B6', rotate: '-4deg' },
          ].map((c, i) => (
            <div key={i} style={{ width: 48, height: 64, borderRadius: 3, background: '#fff', transform: `rotate(${c.rotate})`, boxShadow: '2px 3px 8px rgba(0,0,0,0.4)', padding: 5, paddingBottom: 14, flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: 2, background: c.bg + 'CC' }} />
            </div>
          ))}
        </div>
      );

    case 'coffee-dark-academia':
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80%', height: '80%', border: `1px solid ${a(0.4)}`, borderRadius: 4, padding: 10, position: 'relative', display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 4, border: `1px solid ${a(0.18)}`, borderRadius: 2, pointerEvents: 'none' }} />
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 3, borderRadius: 2, background: a(0.45), flexShrink: 0 }} />
                <div style={{ flex: 1, height: 2, borderRadius: 2, background: a(0.18) }} />
                <div style={{ width: 16, height: 3, borderRadius: 2, background: a(0.55) }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'burger-restaurant':
      return (
        <div style={{ width: '100%', height: '100%', background: '#0A0703', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Hero bold title bar */}
          <div style={{ height: 14, borderRadius: 3, background: '#F59E0B', width: '70%' }} />
          <div style={{ height: 3, borderRadius: 2, background: '#F59E0B55', width: '40%' }} />
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {[0,1,2,3].map((_,i) => (
              <div key={i} style={{ height: 8, width: i === 0 ? 22 : 14, borderRadius: 3, background: i === 0 ? '#F59E0B' : '#2C2114' }} />
            ))}
          </div>
          {/* Cards */}
          <div style={{ display: 'flex', gap: 5, flex: 1, marginTop: 2 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 6, background: '#110D07', border: '1px solid #2C2114', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: '55%', background: `linear-gradient(135deg, #1C1507, #2A1E0D)` }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: '#F59E0B' }} />
                  <div style={{ height: 2, width: '60%', borderRadius: 1, background: '#2C2114' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'dessert-shop':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FFF0F6', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Italic title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #A855F7)' }} />
            <div style={{ height: 5, width: 52, borderRadius: 2, background: '#EC489966' }} />
          </div>
          {/* Pastel tags */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['#F9A8D4','#C4B5FD','#FDE68A'].map((c, i) => (
              <div key={i} style={{ height: 7, width: 22, borderRadius: 100, background: c }} />
            ))}
          </div>
          {/* Cards */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[['#F9A8D4','#E0D4FB'],['#FDE68A','#6EE7B7'],['#BAE6FD','#F9A8D4']].map(([top, bar], i) => (
              <div key={i} style={{ flex: 1, borderRadius: 10, background: 'white', boxShadow: '0 2px 8px rgba(236,72,153,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 3, background: bar }} />
                <div style={{ flex: 1, background: `linear-gradient(135deg, ${top}44, ${bar}22)` }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: '#EC489966' }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#FBCFE8' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'korean-grille':
      return (
        <div style={{ width: '100%', height: '100%', background: '#0D0810', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Ember dots scattered */}
          <div style={{ position: 'relative', height: 10 }}>
            {[['#E91E8C', 18, 2], ['#FF6FCF', 55, 5], ['#9C27B0', 80, 3]].map(([c, x, size], i) => (
              <div key={i} style={{ position: 'absolute', left: `${x}%`, top: 2, width: size as number, height: size as number, borderRadius: '50%', background: c as string, boxShadow: `0 0 4px ${c}` }} />
            ))}
          </div>
          {/* Neon title */}
          <div style={{ height: 14, borderRadius: 2, background: '#F0D0F8', width: '65%', boxShadow: '0 0 8px #E91E8CAA' }} />
          {/* Magenta underline */}
          <div style={{ height: 2, borderRadius: 1, background: 'linear-gradient(90deg, #E91E8C, #9C27B0)', width: '45%' }} />
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2,3].map((_,i) => (
              <div key={i} style={{ height: 7, width: i === 0 ? 22 : 14, borderRadius: 3, background: i === 0 ? '#E91E8C' : '#2E1A32' }} />
            ))}
          </div>
          {/* Cards with glow top bars */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {['#E91E8C','#9C27B0','#FF6FCF'].map((glow, i) => (
              <div key={i} style={{ flex: 1, borderRadius: 6, background: '#160C18', border: `1px solid ${i === 1 ? `${glow}88` : '#2E1A32'}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 3, background: glow }} />
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #1A0E22, #230F2A)' }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: `${glow}AA` }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#2E1A32' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'french-brasserie':
      return (
        <div style={{ width: '100%', height: '100%', background: '#111A14', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Fleur-de-lis + gold title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ color: '#D4AF37', fontSize: 10, lineHeight: 1 }}>⚜</span>
            <div style={{ height: 5, borderRadius: 2, background: '#D4AF3799', width: '50%' }} />
          </div>
          {/* Gold animated rule */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, #D4AF37, #B8942C, transparent)', borderRadius: 1, width: '70%' }} />
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 3 }}>
            {[0,1,2,3,4].map((_,i) => (
              <div key={i} style={{ height: 7, width: i === 0 ? 24 : 16, borderRadius: 2, background: i === 0 ? '#D4AF37' : '#2C4030', border: i !== 0 ? '1px solid #2C4030' : 'none' }} />
            ))}
          </div>
          {/* Dark green cards with gold accents */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 6, background: '#1A2A1E', border: `1px solid ${i === 1 ? '#D4AF3766' : '#2C4030'}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: 2, background: 'linear-gradient(90deg, #D4AF37, #B8942C)' }} />
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #1B3A2D, #152E20)' }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: '#D4AF3799' }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#2C4030' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'ramen-shop':
      return (
        <div style={{ width: '100%', height: '100%', background: '#0C0B14', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Crimson title bar */}
          <div style={{ height: 5, borderRadius: 2, background: '#DC2626', width: '55%' }} />
          {/* Italic subtitle */}
          <div style={{ height: 3, borderRadius: 1, background: '#2A274066', width: '35%' }} />
          {/* Red brush underline */}
          <div style={{ height: 2, borderRadius: 1, background: '#DC262688', width: '40%', marginTop: 2 }} />
          {/* Category row */}
          <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
            {[0,1,2,3].map((_, i) => (
              <div key={i} style={{ height: 7, width: i === 0 ? 24 : 16, borderRadius: 3, background: i === 0 ? '#DC2626' : '#2A2740' }} />
            ))}
          </div>
          {/* Dark cards grid */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 6, background: '#141320', border: `1px solid ${i === 1 ? '#DC262688' : '#2A2740'}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #1C1A2E, #252240)' }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: '#DC2626AA' }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#2A2740' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'mediterranean-restaurant':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAF3E8', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Leaf + title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #C0562A, #D4A843)' }} />
            <div style={{ height: 5, borderRadius: 2, background: '#C0562A99', width: '50%' }} />
          </div>
          {/* Terracotta divider */}
          <div style={{ height: 2, background: 'linear-gradient(90deg, #C0562A, #D4A843, transparent)', borderRadius: 1, width: '70%' }} />
          {/* Category pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['#C0562A','#6B7A3C','#D4A843'].map((c, i) => (
              <div key={i} style={{ height: 7, width: i === 0 ? 26 : 18, borderRadius: 100, background: i === 0 ? c : 'white', border: `1px solid ${c}` }} />
            ))}
          </div>
          {/* Warm cards */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[['#C0562A','#FFF5F0'],['#6B7A3C','#F0F4EC'],['#D4A843','#FFF9EE']].map(([top, bg], i) => (
              <div key={i} style={{ flex: 1, borderRadius: 8, background: bg, boxShadow: `0 2px 6px ${top}18`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ height: '55%', background: `${top}22` }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: `${top}99` }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#E8D5C0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'smoothie-bar':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAFFFE', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
          {/* Floating blobs behind (decorative) */}
          <div style={{ position: 'relative' }}>
            <div style={{ height: 12, borderRadius: 2, background: '#1A2E0A', width: '60%' }} />
            <div style={{ position: 'absolute', top: -4, right: 0, width: 18, height: 18, borderRadius: '60% 40% 30% 70%', background: '#FF6B6B', opacity: 0.3 }} />
          </div>
          {/* Green badge pill */}
          <div style={{ height: 7, width: 70, borderRadius: 100, background: '#DCFCE7', border: '1px solid #22C55E55' }} />
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[0,1,2,3,4].map((_, i) => (
              <div key={i} style={{ height: 7, width: i === 0 ? 22 : 14, borderRadius: 100, background: i === 0 ? '#22C55E' : 'white', border: `1.5px solid ${i === 0 ? '#22C55E' : '#E2E8F0'}` }} />
            ))}
          </div>
          {/* Colorful top-bar cards */}
          <div style={{ display: 'flex', gap: 5, flex: 1 }}>
            {[['#FF6B6B','#FFF5F5'],['#22C55E','#F0FDF4'],['#A855F7','#FAF5FF']].map(([top, bg], i) => (
              <div key={i} style={{ flex: 1, borderRadius: 8, background: bg, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 4, background: top }} />
                <div style={{ flex: 1, background: `${top}18` }} />
                <div style={{ padding: '3px 4px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ height: 3, width: '80%', borderRadius: 1, background: `${top}AA` }} />
                  <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#E2E8F0' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-wellness':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F8F4EE', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Hero: cream bg with terracotta pill + big text + floating right image */}
          <div style={{ flex: 1.8, display: 'flex', padding: '8px 10px', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'inline-flex', padding: '2px 7px', background: 'rgba(194,104,69,0.1)', borderRadius: 100, width: 'fit-content' }}>
                <div style={{ height: 3, width: 28, borderRadius: 1, background: '#6B8F71' }} />
              </div>
              <div style={{ height: 9, width: '90%', borderRadius: 1, background: '#2A1F16' }} />
              <div style={{ height: 9, width: '70%', borderRadius: 1, background: '#C26845' }} />
              <div style={{ height: 2, width: 18, background: '#C26845', borderRadius: 1 }} />
              <div style={{ height: 2, width: '70%', borderRadius: 1, background: 'rgba(42,31,22,0.15)' }} />
              <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
                <div style={{ height: 7, width: 22, background: '#C26845', borderRadius: 100 }} />
                <div style={{ height: 7, width: 22, border: '1.5px solid #6B8F71', borderRadius: 100 }} />
              </div>
            </div>
            <div style={{ flex: 1, borderRadius: '60px 60px 28px 28px', overflow: 'hidden', height: 90, background: '#DDD4C4' }} />
          </div>
          {/* Dark stats strip */}
          <div style={{ background: '#2A1F16', padding: '4px 8px', display: 'flex', justifyContent: 'space-around' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ height: 5, width: 16, borderRadius: 1, background: 'rgba(248,244,238,0.8)', marginBottom: 2 }} />
                <div style={{ height: 2, width: 20, borderRadius: 1, background: 'rgba(248,244,238,0.2)' }} />
              </div>
            ))}
          </div>
          {/* Service cards */}
          <div style={{ padding: '5px 8px 8px', display: 'flex', gap: 5 }}>
            {[['#C26845','#6B8F71','#C26845']].flatMap(c => c).map((col, i) => (
              <div key={i} style={{ flex: 1, background: '#fff', border: '1.5px solid #DDD4C4', borderRadius: 8, padding: '5px 6px' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(194,104,69,0.1)', marginBottom: 5 }} />
                <div style={{ height: 4, width: '70%', borderRadius: 1, background: '#2A1F16', marginBottom: 2 }} />
                <div style={{ height: 2, width: '90%', borderRadius: 1, background: '#EEE7D8' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'services-studio':
      return (
        <div style={{ width: '100%', height: '100%', background: '#080808', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Full-screen hero with bg photo overlay */}
          <div style={{ flex: 2, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=200&q=60) center/cover', opacity: 0.2, filter: 'grayscale(60%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,8,8,1) 35%, transparent)' }} />
            {/* Nav */}
            <div style={{ padding: '6px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 12, height: 12, background: '#E8001C' }} />
                <div style={{ height: 4, width: 22, borderRadius: 1, background: 'rgba(250,250,250,0.7)' }} />
              </div>
              <div style={{ height: 6, width: 18, background: '#E8001C' }} />
            </div>
            {/* Hero text at bottom */}
            <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1 }}>
              <div style={{ height: 3, width: 20, background: '#E8001C', marginBottom: 4 }} />
              <div style={{ height: 10, width: 80, borderRadius: 1, background: 'rgba(250,250,250,0.95)', marginBottom: 3 }} />
              <div style={{ height: 10, width: 52, borderRadius: 1, background: '#E8001C', marginBottom: 3 }} />
              <div style={{ height: 3, width: 56, borderRadius: 1, background: 'rgba(250,250,250,0.25)' }} />
            </div>
          </div>
          {/* Accordion services list */}
          <div style={{ padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1C1C1C', paddingBottom: 3 }}>
                <div style={{ height: 4, width: 40 + i * 8, borderRadius: 1, background: i === 0 ? '#E8001C' : 'rgba(250,250,250,0.4)' }} />
                <div style={{ height: 4, width: 16, borderRadius: 1, background: 'rgba(250,250,250,0.3)' }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'medical-clinic':
      return (
        <div style={{ width: '100%', height: '100%', background: '#FAFCFF', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Navy nav */}
          <div style={{ background: '#1B3A6B', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#2E86DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 6, height: 6, background: '#fff', clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }} />
            </div>
            <div style={{ height: 4, width: 24, borderRadius: 2, background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[16, 20, 16].map((w, i) => <div key={i} style={{ height: 3, width: w, borderRadius: 2, background: 'rgba(255,255,255,0.4)' }} />)}
            </div>
          </div>
          {/* Dark blue hero */}
          <div style={{ background: '#1B3A6B', padding: '10px', flex: 1 }}>
            <div style={{ height: 5, width: 80, borderRadius: 2, background: 'rgba(255,255,255,0.5)', marginBottom: 4 }} />
            <div style={{ height: 3, width: 55, borderRadius: 2, background: 'rgba(255,255,255,0.3)', marginBottom: 8 }} />
            {/* Trust pillar cards */}
            <div style={{ display: 'flex', gap: 4 }}>
              {['#2E86DE','#1B3A6B','#1B3A6B'].map((bg, i) => (
                <div key={i} style={{ flex: 1, background: bg, border: '1px solid rgba(46,134,222,0.4)', borderRadius: 5, padding: '4px 5px' }}>
                  <div style={{ height: 3, width: '70%', borderRadius: 2, background: 'rgba(255,255,255,0.7)', marginBottom: 2 }} />
                  <div style={{ height: 2, width: '50%', borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />
                </div>
              ))}
            </div>
          </div>
          {/* Stats band */}
          <div style={{ background: '#2E86DE', padding: '4px 10px', display: 'flex', justifyContent: 'space-around' }}>
            {['15K+','98%','25+'].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 7, fontWeight: 700, color: '#fff' }}>{s}</div>
              </div>
            ))}
          </div>
          {/* Services grid */}
          <div style={{ padding: '6px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ borderRadius: 4, background: '#EEF4FF', borderTop: `2px solid #2E86DE`, padding: '3px 4px' }}>
                <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#1B3A6B', opacity: 0.5, marginBottom: 2 }} />
                <div style={{ height: 2, width: '55%', borderRadius: 1, background: '#1B3A6B', opacity: 0.25 }} />
              </div>
            ))}
          </div>
        </div>
      );

    case 'medical-pharmacy':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F7FAF8', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Green nav */}
          <div style={{ background: '#0F2D1E', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 1, background: '#00875A' }} />
            <div style={{ height: 4, width: 24, borderRadius: 2, background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[16, 20, 16].map((w, i) => <div key={i} style={{ height: 3, width: w, borderRadius: 2, background: 'rgba(255,255,255,0.35)' }} />)}
            </div>
          </div>
          {/* Dark green hero with search */}
          <div style={{ background: '#0F2D1E', padding: '8px 10px' }}>
            <div style={{ height: 5, width: 70, borderRadius: 2, background: 'rgba(255,255,255,0.5)', marginBottom: 3 }} />
            <div style={{ height: 3, width: 50, borderRadius: 2, background: 'rgba(255,255,255,0.3)', marginBottom: 6 }} />
            {/* Search bar */}
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(0,135,90,0.5)', borderRadius: 4, padding: '3px 6px', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.4)' }} />
              <div style={{ height: 2, flex: 1, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ width: 18, height: 5, borderRadius: 2, background: '#00875A' }} />
            </div>
          </div>
          {/* Products grid */}
          <div style={{ padding: '6px 10px', flex: 1 }}>
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
              {['All','Vitamins','Health'].map((t, i) => (
                <div key={i} style={{ padding: '1px 5px', borderRadius: 3, background: i === 0 ? '#00875A' : '#E6F5EF', fontSize: 5, color: i === 0 ? '#fff' : '#0F2D1E' }}>{t}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ borderRadius: 4, background: '#fff', border: '1px solid #E6F5EF', overflow: 'hidden' }}>
                  <div style={{ height: 18, background: '#E6F5EF' }} />
                  <div style={{ padding: '2px 3px' }}>
                    <div style={{ height: 2, width: '80%', borderRadius: 1, background: '#0F2D1E', opacity: 0.5, marginBottom: 2 }} />
                    <div style={{ height: 2, width: '50%', borderRadius: 1, background: '#00875A', opacity: 0.7 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'clothing-editorial':
      return (
        <div style={{ width:'100%',height:'100%',background:'#0A0A0A',borderRadius:10,display:'flex',flexDirection:'column',overflow:'hidden' }}>
          {/* Ivory nav with gold circle */}
          <div style={{ background:'#F2EDE4',padding:'6px 10px',display:'flex',alignItems:'center',gap:6 }}>
            <div style={{ width:14,height:14,borderRadius:'50%',background:'#0A0A0A',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <div style={{ width:5,height:5,borderRadius:'50%',background:'#C4A55A' }} />
            </div>
            <div style={{ height:4,width:24,borderRadius:2,background:'#0A0A0A',opacity:0.5 }} />
            <div style={{ marginLeft:'auto',display:'flex',gap:4 }}>
              {[16,20,16].map((w,i)=><div key={i} style={{ height:2,width:w,borderRadius:2,background:'#0A0A0A',opacity:0.3 }} />)}
            </div>
          </div>
          {/* Dark hero with gold dots */}
          <div style={{ flex:2,background:'#0A0A0A',padding:'10px',position:'relative',overflow:'hidden' }}>
            {[0,1,2,3].map(i=><div key={i} style={{ position:'absolute',left:`${(i*31+9)%88}%`,top:`${(i*23+13)%80}%`,width:2,height:2,borderRadius:'50%',background:'#C4A55A',opacity:0.4 }} />)}
            <div style={{ width:16,height:1,background:'#C4A55A',marginBottom:5 }} />
            <div style={{ height:5,width:72,borderRadius:2,background:'rgba(242,237,228,0.5)',marginBottom:3 }} />
            <div style={{ height:4,width:50,borderRadius:2,background:'rgba(242,237,228,0.25)',marginBottom:8 }} />
            <div style={{ display:'flex',gap:4 }}>
              <div style={{ width:36,height:10,background:'#C4A55A',borderRadius:1 }} />
              <div style={{ width:36,height:10,border:'1px solid rgba(242,237,228,0.2)',borderRadius:1 }} />
            </div>
          </div>
          {/* Gold ticker */}
          <div style={{ background:'#C4A55A',padding:'4px 10px' }}>
            <div style={{ height:3,width:'80%',borderRadius:2,background:'rgba(10,10,10,0.3)' }} />
          </div>
          {/* Collections grid */}
          <div style={{ padding:'6px 10px',display:'grid',gridTemplateColumns:'2fr 1fr',gap:3,flex:1 }}>
            <div style={{ background:'#1A1510',borderRadius:4,position:'relative',overflow:'hidden' }}>
              <div style={{ position:'absolute',bottom:6,left:6 }}>
                <div style={{ height:3,width:32,borderRadius:1,background:'rgba(242,237,228,0.6)' }} />
              </div>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:3 }}>
              {[0,1].map(i=><div key={i} style={{ flex:1,background:'#1A1510',borderRadius:4 }} />)}
            </div>
          </div>
        </div>
      );

    case 'clothing-streetwear':
      return (
        <div style={{ width:'100%',height:'100%',background:'#0D0D0D',borderRadius:10,display:'flex',flexDirection:'column',overflow:'hidden' }}>
          {/* Black nav with lime VOID block */}
          <div style={{ background:'#0D0D0D',borderBottom:'1px solid rgba(212,245,0,0.12)',padding:'6px 10px',display:'flex',alignItems:'center',gap:0 }}>
            <span style={{ background:'#D4F500',color:'#0D0D0D',fontSize:7,fontWeight:900,padding:'2px 5px',letterSpacing:1 }}>VOID</span>
            <span style={{ color:'#F5F5F5',fontSize:7,fontWeight:900,padding:'2px 4px',letterSpacing:1 }}>DRIP</span>
            <div style={{ marginLeft:'auto',display:'flex',gap:4 }}>
              {[14,18,14].map((w,i)=><div key={i} style={{ height:2,width:w,borderRadius:2,background:'rgba(245,245,245,0.3)' }} />)}
            </div>
          </div>
          {/* Full-screen hero */}
          <div style={{ flex:2,background:'#0D0D0D',padding:'10px',position:'relative',overflow:'hidden' }}>
            {/* Diagonal lime tape */}
            <div style={{ position:'absolute',top:'20%',right:'-5%',width:'45%',height:2,background:'#D4F500',transform:'rotate(-14deg)',opacity:0.5 }} />
            <div style={{ height:3,width:50,borderRadius:1,background:'rgba(212,245,0,0.6)',marginBottom:5 }} />
            <div style={{ fontSize:14,fontWeight:900,color:'#F5F5F5',lineHeight:0.9,marginBottom:6,letterSpacing:1 }}>DROP<br /><span style={{ color:'#D4F500' }}>THE</span><br />MASK</div>
            <div style={{ display:'flex',gap:4 }}>
              <div style={{ width:36,height:10,background:'#D4F500',borderRadius:1 }} />
              <div style={{ width:36,height:10,border:'1px solid rgba(245,245,245,0.2)',borderRadius:1 }} />
            </div>
            {/* Ghost 04 */}
            <div style={{ position:'absolute',bottom:-8,right:4,fontSize:40,fontWeight:900,color:'rgba(212,245,0,0.06)',lineHeight:1 }}>04</div>
          </div>
          {/* Lime ticker */}
          <div style={{ background:'#D4F500',padding:'3px 10px' }}>
            <div style={{ height:3,width:'70%',borderRadius:1,background:'rgba(13,13,13,0.3)' }} />
          </div>
          {/* Product grid */}
          <div style={{ padding:'6px 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:3,flex:1 }}>
            {[0,1,2,3,4,5].map(i=>(
              <div key={i} style={{ border:'1px solid rgba(245,245,245,0.08)',borderRadius:3,overflow:'hidden' }}>
                <div style={{ height:18,background:'#1A1A1A',position:'relative' }}>
                  <div style={{ position:'absolute',top:2,left:2,width:10,height:4,background:'rgba(212,245,0,0.2)',borderRadius:1 }} />
                </div>
                <div style={{ padding:'2px 3px' }}>
                  <div style={{ height:2,width:'70%',borderRadius:1,background:'rgba(245,245,245,0.4)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'clothing-boutique':
      return (
        <div style={{ width:'100%',height:'100%',background:'#FBF8F5',borderRadius:10,display:'flex',flexDirection:'column',overflow:'hidden' }}>
          {/* Cream nav */}
          <div style={{ background:'#FBF8F5',borderBottom:'1px solid rgba(155,112,96,0.15)',padding:'6px 10px',display:'flex',alignItems:'center',gap:6 }}>
            <div style={{ height:4,width:36,borderRadius:2,background:'#1A0F0A',opacity:0.45 }} />
            <div style={{ marginLeft:'auto',display:'flex',gap:4 }}>
              {[14,18,14].map((w,i)=><div key={i} style={{ height:2,width:w,borderRadius:2,background:'#9B7060',opacity:0.4 }} />)}
            </div>
            <div style={{ width:14,height:14,borderRadius:'50%',background:'#9B7060',marginLeft:4 }} />
          </div>
          {/* Hero split */}
          <div style={{ flex:2,display:'flex',gap:6,padding:'8px 10px' }}>
            <div style={{ flex:1 }}>
              {/* Blobs */}
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute',width:30,height:30,borderRadius:'50%',background:'#F2DDD5',opacity:0.5,top:0,left:0 }} />
              </div>
              <div style={{ height:4,width:60,borderRadius:2,background:'#1A0F0A',opacity:0.5,marginBottom:4 }} />
              <div style={{ height:3,width:44,borderRadius:2,background:'#1A0F0A',opacity:0.3,marginBottom:3 }} />
              <div style={{ height:3,width:50,borderRadius:2,background:'#9B7060',opacity:0.5,marginBottom:8 }} />
              <div style={{ display:'flex',gap:4 }}>
                <div style={{ width:32,height:10,background:'#9B7060',borderRadius:10 }} />
                <div style={{ width:32,height:10,border:'1.5px solid #9B7060',borderRadius:10 }} />
              </div>
            </div>
            {/* Right image */}
            <div style={{ flex:'0 0 auto',width:44,position:'relative' }}>
              <div style={{ position:'absolute',inset:-3,border:'1.5px solid #F2DDD5',borderRadius:8 }} />
              <div style={{ borderRadius:6,overflow:'hidden',height:'100%',background:'#F2DDD5' }}>
                <img src="https://images.unsplash.com/photo-1529139574466-a303027614a4?auto=format&fit=crop&w=100&q=60" style={{ width:'100%',height:'100%',objectFit:'cover' }} />
              </div>
            </div>
          </div>
          {/* Blush ticker */}
          <div style={{ background:'#F2DDD5',padding:'3px 10px' }}>
            <div style={{ height:2,width:'65%',borderRadius:1,background:'rgba(155,112,96,0.4)' }} />
          </div>
          {/* Product cards */}
          <div style={{ padding:'6px 10px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:4,flex:1 }}>
            {[0,1,2,3,4,5].map(i=>(
              <div key={i} style={{ background:'#fff',borderRadius:6,overflow:'hidden',border:'1px solid rgba(155,112,96,0.1)' }}>
                <div style={{ height:20,background:'#FAF1EC' }} />
                <div style={{ padding:'2px 3px' }}>
                  <div style={{ height:2,width:'75%',borderRadius:1,background:'#1A0F0A',opacity:0.4,marginBottom:2 }} />
                  <div style={{ height:2,width:'50%',borderRadius:1,background:'#9B7060',opacity:0.6 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'medical-premium':
      return (
        <div style={{ width: '100%', height: '100%', background: '#F9F7F4', borderRadius: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Ivory nav with gold circle mark */}
          <div style={{ background: '#F9F7F4', borderBottom: '1px solid #EDE9E1', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid #C4A35A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C4A35A' }} />
            </div>
            <div style={{ height: 3, width: 24, borderRadius: 2, background: '#12100C', opacity: 0.5 }} />
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              {[16, 20, 16].map((w, i) => <div key={i} style={{ height: 2, width: w, borderRadius: 2, background: '#12100C', opacity: 0.3 }} />)}
            </div>
          </div>
          {/* Dark editorial hero */}
          <div style={{ background: '#12100C', flex: 1, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'url(https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=60) center/cover', opacity: 0.2 }} />
            <div style={{ position: 'relative', padding: '10px' }}>
              {/* Gold accent line */}
              <div style={{ width: 20, height: 1, background: '#C4A35A', marginBottom: 5 }} />
              <div style={{ height: 5, width: 70, borderRadius: 2, background: 'rgba(255,255,255,0.5)', marginBottom: 3 }} />
              <div style={{ height: 4, width: 50, borderRadius: 2, background: 'rgba(255,255,255,0.35)', marginBottom: 6 }} />
              {/* Hero stat sidebar */}
              <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {['15+','98%','VIP'].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(196,163,90,0.2)', border: '1px solid rgba(196,163,90,0.4)', borderRadius: 3, padding: '2px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: 6, fontWeight: 700, color: '#C4A35A' }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Gold stats band */}
          <div style={{ background: '#C4A35A', padding: '4px 10px', display: 'flex', justifyContent: 'space-around' }}>
            {['500+','15Y','5★'].map((s, i) => (
              <div key={i} style={{ fontSize: 6, fontWeight: 700, color: '#12100C' }}>{s}</div>
            ))}
          </div>
          {/* Treatments grid — ghost numbers */}
          <div style={{ padding: '6px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ borderRadius: 4, background: '#EDE9E1', padding: '4px 6px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: 2, bottom: -2, fontSize: 16, fontWeight: 700, color: 'rgba(196,163,90,0.2)', lineHeight: 1 }}>{i+1}</div>
                <div style={{ height: 2, width: '75%', borderRadius: 1, background: '#12100C', opacity: 0.5, marginBottom: 2 }} />
                <div style={{ height: 2, width: '50%', borderRadius: 1, background: '#C4A35A', opacity: 0.6 }} />
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div style={{ width: '100%', height: '100%', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ flex: 1, borderRadius: 8, background: a(0.18 + i * 0.05), border: `1px solid ${a(0.22)}` }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>{row(48, 0.35)}{row(32, 0.2)}</div>
        </div>
      );
  }
}

function TemplateCard({ template: t, selected, onSelect }: {
  template: Template; selected: boolean; onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [previewHovered, setPreviewHovered] = useState(false);
  const [shineKey, setShineKey] = useState(0);
  function handlePreviewEnter() {
    setPreviewHovered(true);
    setShineKey(k => k + 1); // restart shine animation each hover
  }

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPreviewHovered(false); }}
      className="relative rounded-2xl overflow-hidden flex flex-col h-[200px] sm:h-[220px] text-left cursor-pointer outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400 w-full"
      style={{
        background: '#0F1219',
        border: `${selected ? 2 : 1}px solid ${selected ? '#818CF8' : hovered ? '#3D4556' : '#2A2F3D'}`,
        transform: hovered && !selected ? 'scale(1.02)' : 'scale(1)',
        boxShadow: selected
          ? '0 0 24px rgba(99,102,241,0.45), 0 8px 48px rgba(99,102,241,0.15)'
          : hovered
          ? '0 8px 24px rgba(0,0,0,0.4)'
          : 'none',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 150ms ease',
      }}
    >
      {/* ── Preview area ── */}
      <div
        className="relative flex-[5] min-h-0 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})` }}
      >
        {/* Hover overlay brightens gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.06)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 200ms ease',
          }}
        />

        {/* Unique mini UI mockup per template */}
        <TemplatePreviewMockup id={t.id} accent={t.accentColor} />

        {/* Selected check */}
        {selected && (
          <div
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#6366F1', boxShadow: '0 0 12px rgba(99,102,241,0.6)' }}
          >
            <Check size={15} className="text-white" />
          </div>
        )}

        {/* Badges */}
        {t.isNew && !t.isPopular && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md" style={{ background: 'rgba(34,197,94,0.92)' }}>
            <span className="text-[10px] font-extrabold text-white tracking-wide">NEW</span>
          </div>
        )}
        {t.isPopular && (
          <div className="absolute top-2.5 left-2.5 px-2 py-1 rounded-md" style={{ background: 'rgba(245,158,11,0.92)' }}>
            <span className="text-[10px] font-extrabold text-white tracking-wide">POPULAR</span>
          </div>
        )}

        {/* ── Preview button ── */}
        <div
          role="button"
          tabIndex={0}
          onMouseEnter={handlePreviewEnter}
          onMouseLeave={() => setPreviewHovered(false)}
          onClick={e => { e.stopPropagation(); window.open(`/templates/${t.id}`, '_blank'); }}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); window.open(`/templates/${t.id}`, '_blank'); } }}
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer overflow-hidden select-none"
          style={{
            background: previewHovered
              ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
              : 'rgba(0,0,0,0.72)',
            transform: previewHovered
              ? 'scale(1.12) translateY(-2px)'
              : hovered
              ? 'scale(1.04) translateY(0px)'
              : 'scale(0.92) translateY(4px)',
            opacity: hovered ? 1 : 0.7,
            transition: 'all 230ms cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: previewHovered
              ? '0 0 0 1px rgba(129,92,246,0.5), 0 0 18px rgba(99,102,241,0.55), 0 4px 12px rgba(0,0,0,0.35)'
              : 'none',
          }}
        >
          {/* Shine sweep on hover */}
          <span
            key={shineKey}
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.28) 50%, transparent 65%)',
              transform: previewHovered ? 'translateX(100%)' : 'translateX(-100%)',
              transition: previewHovered ? 'transform 480ms ease' : 'none',
            }}
          />

          {/* Play icon */}
          <Play
            size={13}
            className="text-white relative z-10 flex-shrink-0"
            style={{
              transform: previewHovered ? 'scale(1.3)' : 'scale(1)',
              filter: previewHovered ? 'drop-shadow(0 0 3px rgba(255,255,255,0.7))' : 'none',
              transition: 'transform 230ms cubic-bezier(0.34,1.56,0.64,1), filter 180ms ease',
            }}
          />

          {/* Label */}
          <span
            className="text-[11px] font-extrabold text-white relative z-10 tracking-wide"
            style={{
              letterSpacing: previewHovered ? '0.6px' : '0.2px',
              transition: 'letter-spacing 200ms ease',
            }}
          >
            Preview
          </span>
        </div>
      </div>

      {/* ── Info area ── */}
      <div
        className="flex-[3] px-3 py-2.5 flex flex-col min-h-0"
        style={{ background: '#161B26' }}
      >
        <p
          className="text-[13px] sm:text-[14px] font-extrabold leading-tight mb-1 line-clamp-1"
          style={{ color: '#F4F4F5' }}
        >
          {t.name}
        </p>
        <p
          className="text-[11px] sm:text-[12px] leading-snug flex-1 line-clamp-2"
          style={{ color: '#B4C0D0' }}
        >
          {t.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {t.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{ background: '#2A3142', color: '#E2E8F0' }}
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ── Customize step ─────────────────────────────────────────────────────────
const ACCENT_PRESETS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#C4A55A', '#D4F500',
  '#0D9488', '#2E86DE', '#22C55E', '#FF5533', '#DC2626',
  '#9B7060', '#C9A84C', '#E91E8C', '#00D9FF', '#FF6B35',
];

function CustomizeStep({
  selectedTemplate,
  accentColor, onAccentColorChange,
  logoUrl, onLogoUrlChange,
  templateContent, onTemplateContentChange,
  nonClothingContent, onNonClothingContentChange,
}: {
  selectedTemplate: Template | null;
  accentColor: string; onAccentColorChange: (v: string) => void;
  logoUrl: string; onLogoUrlChange: (v: string) => void;
  templateContent: ClothingTemplateContent;
  onTemplateContentChange: (v: ClothingTemplateContent) => void;
  nonClothingContent: TemplateContent;
  onNonClothingContentChange: (v: TemplateContent) => void;
}) {
  const isClothing = selectedTemplate?.businessType === 'clothing';

  const inputStyle: React.CSSProperties = {
    background: '#1A1D28', border: '1px solid #2A2F3D', color: '#F4F4F5',
  };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#818CF8';
    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.2)';
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = '#2A2F3D';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div>
      <h2 className="text-[26px] font-extrabold leading-tight mb-2" style={{ color: '#F4F4F5', letterSpacing: '-0.5px' }}>
        Customize Your Store
      </h2>
      <p className="text-[15px] mb-6" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
        Personalize the text, images, and colors shown in your storefront.
      </p>

      {selectedTemplate && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border"
          style={{ background: '#1A1D28', borderColor: '#2A2F3D' }}
        >
          <div
            className="w-8 h-8 rounded-lg shrink-0"
            style={{ background: `linear-gradient(135deg, ${selectedTemplate.gradient[0]}, ${selectedTemplate.gradient[1]})` }}
          />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#B4C0D0' }}>Selected Template</p>
            <p className="text-sm font-bold" style={{ color: '#F4F4F5' }}>{selectedTemplate.name}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-5">

        {isClothing ? (
          <div
            className="rounded-xl border p-4 max-h-[min(60vh,520px)] overflow-y-auto"
            style={{ background: '#14171F', borderColor: '#2A2F3D' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: '#B4C0D0' }}>
              Edit every headline, image, testimonial, and section on your storefront.
            </p>
            <ClothingTemplateEditor
              content={templateContent}
              onChange={next => {
                onTemplateContentChange(next);
                if (selectedTemplate?.id) {
                  saveTemplateDraft(selectedTemplate.id, next);
                }
              }}
              dark
            />
          </div>
        ) : (
          <div
            className="rounded-xl border p-4 max-h-[min(60vh,520px)] overflow-y-auto"
            style={{ background: '#14171F', borderColor: '#2A2F3D' }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: '#B4C0D0' }}>
              Edit every headline, image, and section on your storefront.
            </p>
            <TemplateEditor
              templateId={selectedTemplate?.id ?? 'retail-classic'}
              content={nonClothingContent}
              onChange={next => {
                onNonClothingContentChange(next);
                if (selectedTemplate?.id) {
                  saveNonClothingDraft(selectedTemplate.id, next);
                }
              }}
            />
          </div>
        )}

        {/* Logo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold" style={{ color: '#B4C0D0' }}>
            Logo URL <span style={{ color: '#555E77', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            type="url"
            value={logoUrl}
            onChange={e => onLogoUrlChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full h-11 rounded-xl text-sm outline-none px-3 transition-all duration-150"
            style={inputStyle}
            onFocus={focusStyle}
            onBlur={blurStyle}
          />
          <p className="text-xs" style={{ color: '#6B7280' }}>Shown in your navigation bar. If left empty, your store initials will be used.</p>
        </div>

        {/* Accent Color */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" style={{ color: '#B4C0D0' }}>Accent Color</label>
          <div className="flex flex-wrap gap-2 items-center">
            {ACCENT_PRESETS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onAccentColorChange(c)}
                className="w-8 h-8 rounded-lg shrink-0 cursor-pointer transition-all duration-150"
                style={{
                  background: c,
                  border: accentColor.toLowerCase() === c.toLowerCase() ? '3px solid #F4F4F5' : '2px solid transparent',
                  boxShadow: accentColor.toLowerCase() === c.toLowerCase() ? '0 0 0 2px #6366F1' : 'none',
                  transform: accentColor.toLowerCase() === c.toLowerCase() ? 'scale(1.18)' : 'scale(1)',
                }}
              />
            ))}
            <label
              className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer shrink-0 relative border-2"
              style={{ borderColor: '#3D4556', borderStyle: 'dashed' }}
              title="Pick a custom color"
            >
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: '#B4C0D0' }}>+</span>
              <input
                type="color"
                value={accentColor}
                onChange={e => onAccentColorChange(e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-5 h-5 rounded-md border" style={{ background: accentColor, borderColor: '#3D4556' }} />
            <span className="text-sm font-mono" style={{ color: '#B4C0D0' }}>{accentColor}</span>
          </div>
          <p className="text-xs" style={{ color: '#6B7280' }}>Used for buttons, highlights, and key accents across your store.</p>
        </div>

      </div>
    </div>
  );
}

// ── Business details step ──────────────────────────────────────────────────
function BusinessDetailsStep({
  businessType, storeName, onStoreNameChange,
  slug, onSlugChange, slugStatus, serviceArea, onServiceAreaChange,
}: {
  businessType: BusinessType; storeName: string; onStoreNameChange: (v: string) => void;
  slug: string; onSlugChange: (v: string) => void; slugStatus: SlugStatus;
  serviceArea: string; onServiceAreaChange: (v: string) => void;
}) {
  const slugSuffix = (
    <span className="flex items-center gap-1.5 text-xs font-semibold">
      {slugStatus === 'checking' && <Loader2 size={12} className="animate-spin" style={{ color: '#B4C0D0' }} />}
      {slugStatus === 'available' && <Check size={12} style={{ color: '#22C55E' }} />}
      {slugStatus === 'available' && <span style={{ color: '#22C55E' }}>Available</span>}
      {slugStatus === 'taken' && <span style={{ color: '#EF4444' }}>Taken</span>}
      {slugStatus === 'invalid' && <span style={{ color: '#F59E0B' }}>Invalid</span>}
    </span>
  );

  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#F4F4F5', letterSpacing: '-0.4px' }}>
        Business Details
      </h2>
      <p className="text-sm mb-6" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
        This is how customers will find and recognise your store.
      </p>

      <div className="flex flex-col gap-4">
        <DarkInput
          label={STORE_NAME_LABELS[businessType]}
          value={storeName}
          onChange={onStoreNameChange}
          placeholder="e.g. Ahmad's Bakery"
        />

        <DarkInput
          label="Store URL"
          value={slug}
          onChange={v => onSlugChange(v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          placeholder="your-store-name"
          hint="Letters, numbers and hyphens only. Min 3 characters."
          suffix={slug ? slugSuffix : undefined}
        />

        {/* URL preview */}
        {slug && (
          <div
            className="px-4 py-3 rounded-xl border"
            style={{ background: 'rgba(99,102,241,0.12)', borderColor: '#2A2F3D' }}
          >
            <p className="text-sm font-bold" style={{ color: '#818CF8' }}>
              khanGates.app/{slug || 'your-shop'}
            </p>
          </div>
        )}

        {businessType === 'services' && (
          <DarkInput
            label="Main Service Area"
            value={serviceArea}
            onChange={onServiceAreaChange}
            placeholder="e.g. Kuala Lumpur"
          />
        )}
      </div>
    </div>
  );
}

// ── Contact step ───────────────────────────────────────────────────────────
function ContactStep({
  businessType, phone, onPhoneChange, address, onAddressChange,
  delivery, onDeliveryChange, pickup, onPickupChange,
  openingHours, onOpeningHoursChange, booking, onBookingChange,
  inquiryMode, onInquiryModeChange,
  password, onPasswordChange, confirmPassword, onConfirmPasswordChange,
  showPassword, onToggleShowPassword,
}: {
  businessType: BusinessType;
  phone: string; onPhoneChange: (v: string) => void;
  address: string; onAddressChange: (v: string) => void;
  delivery: boolean; onDeliveryChange: (v: boolean) => void;
  pickup: boolean; onPickupChange: (v: boolean) => void;
  openingHours: string; onOpeningHoursChange: (v: string) => void;
  booking: boolean; onBookingChange: (v: boolean) => void;
  inquiryMode: boolean; onInquiryModeChange: (v: boolean) => void;
  password: string; onPasswordChange: (v: string) => void;
  confirmPassword: string; onConfirmPasswordChange: (v: string) => void;
  showPassword: boolean; onToggleShowPassword: () => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#F4F4F5', letterSpacing: '-0.4px' }}>
        Contact &amp; Account
      </h2>
      <p className="text-sm mb-6" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
        How customers reach you and set a password for your account.
      </p>

      <div className="flex flex-col gap-4">
        <DarkInput
          label={businessType === 'real_estate' ? 'Office WhatsApp' : 'Phone / WhatsApp Number'}
          value={phone}
          onChange={onPhoneChange}
          placeholder="+60 1X-XXX XXXX"
          type="tel"
          prefix={MessageCircle}
        />

        {/* Password section */}
        <div className="flex flex-col gap-4 pt-4" style={{ borderTop: '1px solid #2A2F3D' }}>
          <p className="text-sm font-bold" style={{ color: '#B4C0D0' }}>Set your account password</p>

          <DarkInput
            label="Password"
            value={password}
            onChange={onPasswordChange}
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            prefix={Lock}
            suffix={
              <button
                type="button"
                onClick={onToggleShowPassword}
                className="p-0.5 rounded transition-colors cursor-pointer"
                style={{ color: '#B4C0D0' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <DarkInput
            label="Confirm Password"
            value={confirmPassword}
            onChange={onConfirmPasswordChange}
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            prefix={Lock}
          />
        </div>

        <DarkInput
          label="Address"
          value={address}
          onChange={onAddressChange}
          placeholder="Full business address"
          prefix={MapPin}
        />

        {(businessType === 'retail' || businessType === 'restaurant') && (
          <DarkToggle
            checked={delivery}
            onChange={onDeliveryChange}
            label="Delivery Available"
            subtitle="Customers can order for delivery"
          />
        )}

        {businessType === 'restaurant' && (
          <>
            <DarkToggle
              checked={pickup}
              onChange={onPickupChange}
              label="Self-Pickup Available"
              subtitle="Customers can pick up their orders"
            />
            <DarkInput
              label="Opening Hours"
              value={openingHours}
              onChange={onOpeningHoursChange}
              placeholder="e.g. 9am – 10pm, daily"
              prefix={Clock}
            />
          </>
        )}

        {businessType === 'services' && (
          <DarkToggle
            checked={booking}
            onChange={onBookingChange}
            label="Online Booking"
            subtitle="Let customers book appointments directly"
          />
        )}

        {businessType === 'catalog' && (
          <DarkToggle
            checked={inquiryMode}
            onChange={onInquiryModeChange}
            label="WhatsApp Inquiry Mode"
            subtitle="Customers contact you via WhatsApp instead of checkout"
          />
        )}
      </div>
    </div>
  );
}

// ── Phone OTP verification step ─────────────────────────────────────────────
function OtpVerifyStep({
  phone, code, onCodeChange, onResend, resendCooldown,
}: {
  phone: string; code: string; onCodeChange: (v: string) => void;
  onResend: () => void; resendCooldown: number;
}) {
  return (
    <div>
      <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#F4F4F5', letterSpacing: '-0.4px' }}>
        Verify Your Phone
      </h2>
      <p className="text-sm mb-6" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
        We sent a 6-digit code to {phone}. Enter it below to continue.
      </p>

      <div className="flex flex-col gap-4">
        <DarkInput
          label="Verification Code"
          value={code}
          onChange={v => onCodeChange(v.replace(/[^0-9]/g, '').slice(0, 6))}
          placeholder="123456"
          type="text"
          prefix={MessageCircle}
        />

        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0}
          className="self-start text-sm font-semibold transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          style={{ color: '#818CF8' }}
        >
          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(0);

  // Step 1 — Choose Design
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>('retail-classic');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TemplateFilter>('all');
  const [pageIndex, setPageIndex] = useState(0);

  // Step 2 — Business Details
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [serviceArea, setServiceArea] = useState('');
  const slugTimer = useRef<ReturnType<typeof setTimeout>>();

  // Step 0 — Contact & Account
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [pickup, setPickup] = useState(false);
  const [openingHours, setOpeningHours] = useState('');
  const [booking, setBooking] = useState(false);
  const [inquiryMode, setInquiryMode] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [awaitingOtp, setAwaitingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneAccountVerified, setPhoneAccountVerified] = useState(false);

  // Step 3
  const [brandDescription, setBrandDescription] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [logoUrl, setLogoUrl] = useState('');
  const [templateContent, setTemplateContent] = useState<ClothingTemplateContent>(() =>
    defaultClothingContent('clothing-boutique'),
  );
  const [nonClothingContent, setNonClothingContent] = useState<TemplateContent>(() =>
    mergeTemplateContent('retail-classic'),
  );

  const [finishing, setFinishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [accountConflict, setAccountConflict] = useState(false);

  const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) ?? null;
  const businessType: BusinessType = selectedTemplate?.businessType ?? 'retail';

  // Filtered templates
  const filteredTemplates = useMemo(() =>
    TEMPLATES.filter(t => {
      const ok = activeFilter === 'all' || t.tags.includes(activeFilter);
      if (!ok) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (t.name + ' ' + t.description + ' ' + t.tags.join(' ')).toLowerCase().includes(q);
    }),
    [activeFilter, searchQuery],
  );

  const PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PER_PAGE));
  const safePage = Math.min(pageIndex, totalPages - 1);
  const pageItems = filteredTemplates.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);

  // Sync accent color when template changes
  useEffect(() => {
    if (selectedTemplate?.accentColor) setAccentColor(selectedTemplate.accentColor);
  }, [selectedTemplateId]);

  // Load clothing template defaults when a clothing design is selected
  useEffect(() => {
    if (selectedTemplateId && isClothingTemplateId(selectedTemplateId)) {
      const base = defaultClothingContent(selectedTemplateId);
      setTemplateContent(base);
      setBrandDescription(base.heroDescription);
      setHeroImageUrl(base.heroImageUrl);
    } else if (selectedTemplateId) {
      setNonClothingContent(mergeTemplateContent(selectedTemplateId));
    }
  }, [selectedTemplateId]);

  // OTP resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-slug from store name
  useEffect(() => {
    if (storeName && !slug) setSlug(toSlug(storeName));
  }, [storeName]);

  // Debounced slug check
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return; }
    setSlugStatus('checking');
    clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      const s = await checkSlug(slug);
      setSlugStatus(s);
    }, 650);
    return () => clearTimeout(slugTimer.current);
  }, [slug]);

  const handleContinue = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setAccountConflict(false);

    if (step === 0) {
      if (!phone) { setErrorMsg('Please enter your phone number.'); return; }
      if (!isValidPhone(phone)) { setErrorMsg('Please enter a valid phone number (e.g. +60 12-345 6789).'); return; }
      if (!password || password.length < 8) { setErrorMsg('Password must be at least 8 characters.'); return; }
      if (password !== confirmPassword) { setErrorMsg('Passwords do not match.'); return; }

      const existingToken = localStorage.getItem('sl_access_token') ?? localStorage.getItem('authToken');
      if (existingToken) {
        // Token already issued this session (e.g. user hit Back after registering) — don't
        // re-register, but still gate on verification rather than blindly skipping ahead.
        if (phoneAccountVerified) {
          setStep(1);
        } else {
          setAwaitingOtp(true);
        }
        return;
      }

      setFinishing(true);
      try {
        const { registerByPhone, login } = await import('@/lib/api/auth');
        let user;
        try {
          user = await registerByPhone({
            phone,
            fullName: storeName || 'Store Owner',
            shopName: storeName || undefined,
            password,
          });
        } catch (e: any) {
          const msg: string = e?.message ?? 'Registration failed';
          if (msg === 'PHONE_EXISTS') {
            // Phone already registered — surface that clearly, then log in to get a token
            // rather than silently swapping accounts underneath the merchant.
            if (phone && password) {
              setInfoMsg('This number already has an account — signing you in instead.');
              try {
                user = await login(phone, password);
              } catch {
                setInfoMsg('');
                setErrorMsg("This number already has an account, but that password doesn't match. Log in instead, or reset your password.");
                setAccountConflict(true);
                return;
              }
            } else {
              setErrorMsg('This phone number is already registered. Please log in first.');
              return;
            }
          } else {
            setErrorMsg(msg);
            return;
          }
        }
        setInfoMsg('');
        setPhoneAccountVerified(user.phoneVerified);
        if (user.phoneVerified) {
          setStep(1);
        } else {
          setAwaitingOtp(true);
        }
      } catch (e: any) {
        setErrorMsg(`Account error: ${e?.message ?? 'Registration failed'}`);
      } finally {
        setFinishing(false);
      }
    } else if (step === 1) {
      if (!selectedTemplateId) {
        setErrorMsg('Please select a storefront design to continue.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (slug && (slugStatus === 'taken' || slugStatus === 'invalid')) {
        setErrorMsg(slugStatus === 'taken'
          ? 'That URL is already taken. Choose a different one.'
          : 'URL must be at least 3 characters — letters, numbers and hyphens only.');
        return;
      }
      setStep(3);
    } else {
      setFinishing(true);
      try {
        // Map businessType → backend categorySlug
        const CATEGORY_MAP: Record<string, string> = {
          restaurant: 'restaurants-cafes',
          retail: 'general-store',
          clothing: 'clothes-fashion',
          services: 'beauty-salon',
          real_estate: 'general-store',
          medical: 'general-store',
          catalog: 'general-store',
        };
        // Map template id → subcategory slug (restaurant only)
        const SUBCATEGORY_MAP: Record<string, string> = {
          'restaurant-default': 'fast-food',
          'cafe': 'cafe',
          'coffee-cyber-brew': 'cafe',
          'coffee-green-leaf': 'cafe',
          'coffee-retro-groove': 'cafe',
          'coffee-blossom': 'cafe',
          'coffee-neon-drip': 'cafe',
          'coffee-luxury-espresso': 'cafe',
          'coffee-aurora-brew': 'cafe',
          'coffee-tropical-bloom': 'cafe',
          'coffee-dark-academia': 'cafe',
          'burger-restaurant': 'burger-restaurant',
          'dessert-shop': 'dessert-shop',
          'ramen-shop': 'fast-food',
          'mediterranean-restaurant': 'fast-food',
          'smoothie-bar': 'healthy-food',
          'korean-grille': 'fast-food',
          'french-brasserie': 'fast-food',
          'clothing-boutique': 'clothing-boutique',
          'clothing-editorial': 'clothing-editorial',
          'clothing-streetwear': 'clothing-streetwear',
        };

        const categorySlug = CATEGORY_MAP[businessType] ?? 'general-store';
        const subCategorySlug = SUBCATEGORY_MAP[selectedTemplateId ?? ''];
        const finalSlug = slug || toSlug(storeName || 'my-store');
        const isClothing = businessType === 'clothing' && isClothingTemplateId(selectedTemplateId ?? '');
        const mergedClothing = isClothing
          ? mergeClothingContent(selectedTemplateId!, templateContent)
          : null;
        const descriptionText = isClothing
          ? (mergedClothing!.heroDescription || brandDescription)
          : (nonClothingContent.heroDescription || brandDescription);
        const coverImage = isClothing
          ? (mergedClothing!.heroImageUrl || heroImageUrl)
          : (nonClothingContent.heroImageUrl || heroImageUrl);

        const payload = {
          name: storeName || 'My Store',
          slug: finalSlug,
          categorySlug,
          ...(subCategorySlug ? { subCategorySlug } : {}),
          ...(selectedTemplateId ? { templateKey: selectedTemplateId } : {}),
          ...(descriptionText ? { description: descriptionText } : {}),
          ...(coverImage ? { coverImageUrl: coverImage } : {}),
          ...(logoUrl ? { logoUrl } : {}),
          ...(phone ? { phone, whatsappNumber: phone } : {}),
          ...(address ? { address } : {}),
          ...(accentColor ? { primaryColor: accentColor } : {}),
        };

        if (isClothing && mergedClothing) {
          saveTemplateContentForSlug(finalSlug, mergedClothing);
          saveTemplateDraft(selectedTemplateId!, mergedClothing);
        } else if (!isClothing && selectedTemplateId) {
          saveNonClothingContent(finalSlug, nonClothingContent);
          saveNonClothingDraft(selectedTemplateId, nonClothingContent);
        }

        // Reuse the idempotency key + original save time from any existing draft for this same
        // slug, so retries (including a later replay from /onboarding/follow-up) are safe to run
        // more than once. A different slug means a genuinely new submission — fresh key/timestamp.
        let idempotencyKey = '';
        let savedAt = Date.now();
        try {
          const existingRaw = localStorage.getItem('shoplink_store');
          if (existingRaw) {
            const existing = JSON.parse(existingRaw);
            if (existing?.slug === finalSlug && existing?.idempotencyKey) {
              idempotencyKey = existing.idempotencyKey;
              savedAt = existing.savedAt ?? savedAt;
            }
          }
        } catch { /* ignore */ }
        if (!idempotencyKey) {
          idempotencyKey = crypto.randomUUID();
        }

        try {
          localStorage.setItem('shoplink_store', JSON.stringify({
            name: storeName || 'My Store',
            slug: finalSlug,
            businessType,
            category: categorySlug,
            description: descriptionText,
            phone,
            address,
            theme: selectedTemplateId ?? (
              businessType === 'clothing' ? 'clothing-boutique'
              : businessType === 'restaurant' ? 'restaurant-default'
              : 'retail-classic'
            ),
            logo: logoUrl || undefined,
            coverImage: coverImage || undefined,
            ...(mergedClothing ? { templateContent: mergedClothing } : {}),
            // Matches the server-enforced default (StoreService.create() always starts DRAFT) —
            // this is just the optimistic local guess shown before the dashboard's first fetch
            // confirms real status, so it must not claim a state the backend won't grant.
            status: 'draft',
            currency: 'JOD',
            timezone: 'UTC',
            locale: 'en',
            email: '',
            idempotencyKey,
            savedAt,
          }));
          initStoreData(finalSlug);
        } catch { /* ignore */ }

        // Register account if not already logged in
        const existingToken = localStorage.getItem('sl_access_token') ?? localStorage.getItem('authToken');
        if (!existingToken) {
          try {
            const { registerByPhone, login } = await import('@/lib/api/auth');
            try {
              await registerByPhone({
                phone,
                fullName: storeName || 'Store Owner',
                shopName: storeName || undefined,
                password,
              });
            } catch (e: any) {
              const msg: string = e?.message ?? 'Registration failed';
              if (msg === 'PHONE_EXISTS') {
                // Phone already registered — surface that clearly, then log in to get a token
                // rather than silently swapping accounts underneath the merchant.
                if (phone && password) {
                  setInfoMsg('This number already has an account — signing you in instead.');
                  try {
                    await login(phone, password);
                    setInfoMsg('');
                  } catch {
                    setInfoMsg('');
                    setErrorMsg("This number already has an account, but that password doesn't match. Log in instead, or reset your password.");
                    setAccountConflict(true);
                    return;
                  }
                } else {
                  setErrorMsg('This phone number is already registered. Please log in first.');
                  return;
                }
              } else {
                throw e;
              }
            }
          } catch (e: any) {
            setErrorMsg(`Account error: ${e?.message ?? 'Registration failed'}`);
            return;
          }
        }

        try {
          const { createStore } = await import('@/lib/api/stores');
          await createStore(payload, idempotencyKey);
          router.push(dashboardPath(finalSlug));
        } catch (e: any) {
          const msg = e?.message ?? '';
          // If backend is unreachable (network error) go to follow-up, otherwise show the real error
          if (!msg || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to')) {
            router.push('/onboarding/follow-up');
          } else {
            setErrorMsg(`Could not create store: ${msg}`);
          }
        }
      } finally {
        setFinishing(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMsg('');
    if (!/^\d{6}$/.test(otpCode)) {
      setErrorMsg('Enter the 6-digit code.');
      return;
    }
    setOtpSubmitting(true);
    try {
      const { verifyPhone } = await import('@/lib/api/auth');
      await verifyPhone(phone, otpCode);
      setAwaitingOtp(false);
      setOtpCode('');
      setPhoneAccountVerified(true);
      setStep(1);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Invalid or expired code.');
    } finally {
      setOtpSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setResendCooldown(30);
    try {
      const { resendPhoneVerification } = await import('@/lib/api/auth');
      await resendPhoneVerification(phone);
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Could not resend code.');
    }
  };

  const continueLabel =
    step === 0 ? 'Continue to Design' :
    step === 1 ? 'Continue to Business Details' :
    step === 2 ? 'Continue to Customize' :
    step === LAST_STEP ? 'Create Store' :
    'Continue';

  const maxWClass =
    step === 1 ? 'max-w-[1280px]' :
    step === 3 ? 'max-w-[1280px]' :
    'max-w-[720px]';

  return (
    <>
      {/* Navy animated background */}
      <div
        className="fixed inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 login-aurora-1"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(129,92,246,0.05) 100%)' }}
          />
          <div
            className="absolute inset-0 login-aurora-2"
            style={{ background: 'linear-gradient(225deg, rgba(167,139,250,0.06) 0%, transparent 60%)' }}
          />
          <div className="absolute inset-0 login-grid opacity-60" />
          <div
            className="absolute w-[500px] h-[500px] -top-32 -left-32 rounded-full login-blob-1"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-[400px] h-[400px] -bottom-20 -right-20 rounded-full login-blob-2"
            style={{ background: 'radial-gradient(circle, rgba(129,92,246,0.10) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-[350px] h-[350px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full login-blob-3"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }}
          />
        </div>
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 glass-nav px-4 md:px-6 h-14 flex items-center justify-between">
        <span className="text-white font-extrabold text-[17px] font-jakarta tracking-tight">
          Set Up Your Store
        </span>
        <span className="text-white/50 text-sm font-semibold font-jakarta">khanGates</span>
      </div>

      {/* Scrollable content */}
      <main className="relative z-10 min-h-dvh pt-14 pb-6 px-4 flex flex-col">
        <div className={cn('w-full mx-auto flex-1 flex flex-col pt-4 transition-all duration-300', maxWClass)}>

          {/* Glass content panel */}
          <div
            className="rounded-[20px] border p-5 md:p-7 mb-3 flex-1"
            style={{
              background: 'rgba(20, 23, 31, 0.97)',
              borderColor: '#2A2F3D',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            }}
          >
            <ProgressBar step={step} lastStep={LAST_STEP} />

            <div className="mt-4 mb-6">
              <StepPills currentStep={step} labels={STEP_LABELS} />
            </div>

            {infoMsg && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2"
                style={{ background: 'rgba(99,102,241,0.10)', borderColor: 'rgba(99,102,241,0.30)', color: '#A5B4FC' }}
              >
                <Loader2 size={14} className="animate-spin shrink-0" />
                {infoMsg}
              </div>
            )}

            {errorMsg && (
              <div
                className="mb-4 px-4 py-3 rounded-xl text-sm font-medium border"
                style={{ background: 'rgba(239,68,68,0.10)', borderColor: 'rgba(239,68,68,0.30)', color: '#FCA5A5' }}
              >
                {errorMsg}
                {accountConflict && (
                  <div className="mt-2.5 flex gap-4">
                    <a
                      href="/login"
                      className="text-sm font-bold transition-opacity hover:opacity-75"
                      style={{ color: '#818CF8' }}
                    >
                      Log in instead
                    </a>
                    <a
                      href={`/forgot-password?mode=phone&phone=${encodeURIComponent(phone)}`}
                      className="text-sm font-bold transition-opacity hover:opacity-75"
                      style={{ color: '#818CF8' }}
                    >
                      Reset your password
                    </a>
                  </div>
                )}
              </div>
            )}

            <div key={`${step}-${awaitingOtp}`} className="animate-fadeIn">
              {step === 0 && awaitingOtp && (
                <OtpVerifyStep
                  phone={phone}
                  code={otpCode}
                  onCodeChange={setOtpCode}
                  onResend={handleResendOtp}
                  resendCooldown={resendCooldown}
                />
              )}
              {step === 0 && !awaitingOtp && (
                <ContactStep
                  businessType={businessType}
                  phone={phone} onPhoneChange={setPhone}
                  address={address} onAddressChange={setAddress}
                  delivery={delivery} onDeliveryChange={setDelivery}
                  pickup={pickup} onPickupChange={setPickup}
                  openingHours={openingHours} onOpeningHoursChange={setOpeningHours}
                  booking={booking} onBookingChange={setBooking}
                  inquiryMode={inquiryMode} onInquiryModeChange={setInquiryMode}
                  password={password} onPasswordChange={setPassword}
                  confirmPassword={confirmPassword} onConfirmPasswordChange={setConfirmPassword}
                  showPassword={showPassword} onToggleShowPassword={() => setShowPassword(v => !v)}
                />
              )}
              {step === 1 && (
                <TemplateGalleryStep
                  selectedId={selectedTemplateId}
                  onSelect={id => {
                    setSelectedTemplateId(id);
                    setErrorMsg('');
                    try { localStorage.setItem('sl_selected_template', id); } catch { /* ignore */ }
                  }}
                  searchQuery={searchQuery}
                  onSearchChange={q => { setSearchQuery(q); setPageIndex(0); }}
                  activeFilter={activeFilter}
                  onFilterChange={f => { setActiveFilter(f); setPageIndex(0); }}
                  filtered={filteredTemplates}
                  pageItems={pageItems}
                  pageIndex={safePage}
                  totalPages={totalPages}
                  onGoPage={(next, fwd) => { setPageIndex(next); }}
                />
              )}
              {step === 2 && (
                <BusinessDetailsStep
                  businessType={businessType}
                  storeName={storeName}
                  onStoreNameChange={setStoreName}
                  slug={slug}
                  onSlugChange={v => {
                    setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                  }}
                  slugStatus={slugStatus}
                  serviceArea={serviceArea}
                  onServiceAreaChange={setServiceArea}
                />
              )}
              {step === 3 && (
                <CustomizeStep
                  selectedTemplate={selectedTemplate}
                  accentColor={accentColor}
                  onAccentColorChange={setAccentColor}
                  logoUrl={logoUrl}
                  onLogoUrlChange={setLogoUrl}
                  templateContent={templateContent}
                  onTemplateContentChange={setTemplateContent}
                  nonClothingContent={nonClothingContent}
                  onNonClothingContentChange={setNonClothingContent}
                />
              )}
            </div>
          </div>

          {/* Navigation bar */}
          <div
            className="rounded-2xl border p-4 shrink-0"
            style={{
              background: 'rgba(20, 23, 31, 0.98)',
              borderColor: '#2A2F3D',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
            }}
          >
            <div className="flex gap-3">
              {(step > 0 || awaitingOtp) && (
                <button
                  onClick={() => {
                    setErrorMsg('');
                    if (awaitingOtp) {
                      setAwaitingOtp(false);
                    } else {
                      setStep(s => s - 1);
                    }
                  }}
                  disabled={finishing || otpSubmitting}
                  className="flex-1 h-12 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-150 disabled:opacity-40 border"
                  style={{ borderColor: '#B4C0D0', color: '#F4F4F5' }}
                >
                  Back
                </button>
              )}
              <button
                onClick={awaitingOtp ? handleVerifyOtp : handleContinue}
                disabled={finishing || otpSubmitting}
                className="flex-1 h-12 rounded-xl text-[15px] font-bold text-white cursor-pointer transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#6366F1' }}
                onMouseEnter={e => { if (!finishing && !otpSubmitting) e.currentTarget.style.background = '#4F46E5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#6366F1'; }}
              >
                {(finishing || otpSubmitting) && <Loader2 size={16} className="animate-spin" />}
                {awaitingOtp ? 'Verify Phone' : continueLabel}
              </button>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
