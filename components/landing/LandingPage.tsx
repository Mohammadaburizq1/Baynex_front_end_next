'use client';

import Link from 'next/link';
import { useState } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { Pricing as PricingBlock } from '@/components/blocks/pricing';
import { PRICING_PLANS } from '@/lib/data/pricing-plans';

/* ─── Design tokens ─────────────────────────────────────────────────── */
const C = {
  navy: '#0A1628',
  indigo: '#6366F1',
  indigoEnd: '#818CF8',
  yellow: '#FBBF24',
  red: '#EF4444',
  title: '#1E1B4B',
  label: '#475569',
  white: '#FFFFFF',
};

/* ─── Shared primitives ─────────────────────────────────────────────── */
function GlassSurface({
  children,
  className = '',
  highlighted = false,
  style = {},
}: {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`glass-surface rounded-2xl ${className}`}
      style={{
        ...(highlighted
          ? { border: `1px solid ${C.indigo}55`, boxShadow: `0 0 0 1px ${C.indigo}22 inset` }
          : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function IndigoBtn({
  href,
  children,
  expand = false,
}: {
  href: string;
  children: React.ReactNode;
  expand?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 font-jakarta font-bold text-white rounded-xl px-6 py-3 text-sm transition-opacity hover:opacity-90 ${expand ? 'w-full' : ''}`}
      style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoEnd})` }}
    >
      {children}
    </Link>
  );
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-jakarta font-semibold text-white/80 hover:text-white text-sm px-4 py-3 rounded-xl transition-colors"
    >
      {children}
    </Link>
  );
}

function SecondaryBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 font-jakarta font-bold text-white text-sm px-6 py-3 rounded-xl transition-colors"
      style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)' }}
    >
      {children}
    </Link>
  );
}

/* ─── Sections ──────────────────────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6 h-[72px] flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoEnd})` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="font-jakarta font-extrabold text-white text-lg">khanGates</span>
        </Link>

        <div className="flex-1" />

        <div className="hidden sm:flex items-center gap-1">
          <GhostBtn href="/login">Merchant Login</GhostBtn>
        </div>
        <IndigoBtn href="/onboarding">Start Free 🚀</IndigoBtn>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pt-16 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-start gap-12">
        {/* Copy */}
        <div className="flex-[11] flex flex-col items-start">
          {/* Badge */}
          <div
            className="flex items-center gap-2 rounded-full px-3.5 py-2 mb-6 font-jakarta text-xs font-bold tracking-widest uppercase opacity-0 scale-in animate-stagger-1"
            style={{ background: `${C.yellow}1f`, color: C.yellow, border: `1px solid ${C.yellow}30` }}
          >
            ✨ No-code stores for every merchant
          </div>

          <h1
            className="font-jakarta font-extrabold leading-[1.1] tracking-tight text-white mb-4 opacity-0 slide-in-left animate-stagger-2"
            style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}
          >
            Launch your online store{' '}
            <span
              style={{
                background: `linear-gradient(90deg, #fff 0%, #E2E8F0 55%, ${C.yellow} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              in 5 minutes
            </span>
          </h1>

          <p className="font-jakarta text-white/75 text-lg leading-relaxed mb-8 max-w-xl opacity-0 slide-in-left animate-stagger-3">
            Create a beautiful storefront, accept WhatsApp orders, and manage your business from anywhere — no code required.
          </p>

          <div className="flex flex-wrap gap-3 mb-10 opacity-0 slide-in-left animate-stagger-4">
            <IndigoBtn href="/onboarding">🚀 Start for Free</IndigoBtn>
            <SecondaryBtn href="/templates/restaurant-default">▶ View Demo</SecondaryBtn>
            <GhostBtn href="/login">Merchant Login</GhostBtn>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg opacity-0 slide-in-left animate-stagger-5">
            {[
              { v: '5 min', l: 'Store setup' },
              { v: '0', l: 'Domain required' },
              { v: '24/7', l: 'WhatsApp orders' },
            ].map((s, i) => (
              <GlassSurface 
                key={s.l} 
                className={`p-4 opacity-100 scale-in ${i === 0 ? 'animate-stagger-1' : i === 1 ? 'animate-stagger-2' : 'animate-stagger-3'}`}
              >
                <p className="font-jakarta font-extrabold text-2xl text-white leading-none">{s.v}</p>
                <p className="font-jakarta text-xs text-white/60 mt-1">{s.l}</p>
              </GlassSurface>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="flex-[9] opacity-0 slide-in-right animate-stagger-3">
          <GlassSurface className="p-5 overflow-hidden">
            <div
              className="h-2 rounded full mb-5"
              style={{ background: `linear-gradient(90deg, ${C.indigo}, ${C.yellow}, ${C.red})` }}
            />
            <DashboardPreview />
          </GlassSurface>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#F8FAFC', minHeight: 280 }}>
      {/* Mock top bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 h-5 bg-gray-200 rounded-full text-[10px] flex items-center justify-center text-gray-400 font-mono">
          khanGates.app/dashboard
        </div>
      </div>

      <div className="flex h-[240px]">
        {/* Sidebar */}
        <div className="w-14 border-r border-gray-100 flex flex-col items-center py-3 gap-3">
          {['#6366F1','#94A3B8','#94A3B8','#94A3B8','#94A3B8'].map((c, i) => (
            <div key={i} className="w-8 h-8 rounded-lg" style={{ background: c + '22', border: `1px solid ${c}44` }}>
              <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ color: c, fontSize: 14 }}>
                {['🏠','📦','🛒','📊','⚙️'][i]}
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <p className="font-jakarta font-bold text-sm text-gray-800 mb-3">Dashboard Overview</p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: 'Orders', v: '142', c: C.indigo },
              { l: 'Revenue', v: '$2.4k', c: '#16A34A' },
              { l: 'Products', v: '38', c: C.yellow },
            ].map((s) => (
              <div key={s.l} className="rounded-lg p-2.5" style={{ background: s.c + '12', border: `1px solid ${s.c}22` }}>
                <p className="font-jakarta text-[10px] text-gray-500">{s.l}</p>
                <p className="font-jakarta font-bold text-sm" style={{ color: s.c }}>{s.v}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {['Spaghetti Pasta · $14', 'Burger Meal · $15.5', 'Chicken Noodles · $13'].map((r) => (
              <div key={r} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                <div className="w-5 h-5 rounded-full bg-indigo-100" />
                <p className="font-jakarta text-[11px] text-gray-600 flex-1">{r}</p>
                <span className="text-[10px] text-green-600 font-bold">✓ Paid</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustStrip() {
  const tags = ['WhatsApp-ready', 'Arabic & English', 'No-code storefront', 'Delivery zones', 'Free to start'];
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-20">
      <GlassSurface className="px-6 py-4 flex flex-wrap items-center justify-center gap-3">
        <span className="font-jakarta text-xs font-bold tracking-widest text-white/50 uppercase">Built for merchants</span>
        {tags.map((t) => (
          <span
            key={t}
            className="font-jakarta text-sm text-white/80 px-3 py-1.5 rounded-full"
            style={{ background: `${C.indigo}14`, border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {t}
          </span>
        ))}
      </GlassSurface>
    </section>
  );
}

const FEATURES = [
  { icon: '🌐', color: C.indigo,  title: 'Beautiful Storefronts',  body: 'Choose from 20+ templates. Restaurants, retail, real estate, services — all no-code.' },
  { icon: '💬', color: '#25D366', title: 'WhatsApp Orders',         body: 'Customers order directly via WhatsApp. No app downloads, no friction.' },
  { icon: '🗺️', color: C.yellow,  title: 'Delivery Zones',          body: 'Set custom delivery areas and fees. Control exactly where you deliver.' },
  { icon: '📦', color: C.indigoEnd,title: 'Inventory Tracking',     body: 'Real-time stock levels. Get alerts before you run out.' },
  { icon: '📊', color: C.red,     title: 'Sales Insights',          body: 'Revenue trends, top products, and customer analytics in one dashboard.' },
  { icon: '👥', color: C.indigo,  title: 'Customer CRM',            body: 'Track repeat buyers, order history, and send targeted offers.' },
  { icon: '🏷️', color: C.yellow,  title: 'Offers & Discounts',      body: 'Time-limited deals, bundle offers, and coupon codes with zero effort.' },
  { icon: '💡', color: C.yellow,  title: 'AI Suggestions',          body: 'Smart product recommendations and upsell prompts built right in.' },
];

function Features() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-24">
      <SectionHeader eyebrow="Features" title="Everything you need to sell online" />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ icon, color, title, body }: { icon: string; color: string; title: string; body: string }) {
  return (
    <GlassSurface className="p-5 hover:-translate-y-0.5 transition-transform duration-200">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
        style={{ background: `${color}20`, border: `1px solid ${color}35` }}
      >
        {icon}
      </div>
      <h3 className="font-jakarta font-bold text-white text-[17px] mb-2">{title}</h3>
      <p className="font-jakarta text-white/60 text-sm leading-relaxed">{body}</p>
    </GlassSurface>
  );
}

const STEPS = [
  'Sign up free — no credit card needed',
  'Choose your business type and template',
  'Add your products or menu items',
  'Share your store link via WhatsApp or social',
  'Start receiving orders instantly',
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-24">
      <GlassSurface className="p-8 sm:p-10" style={{ background: 'rgba(19,47,92,0.35)' }}>
        <SectionHeader eyebrow="Process" title="Up and running in minutes" light />
        <div className="mt-10 flex flex-col lg:flex-row gap-6">
          {STEPS.map((text, i) => (
            <div key={i} className="flex-1 flex lg:flex-col items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-jakarta font-extrabold text-white text-sm flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoEnd})` }}
              >
                {i + 1}
              </div>
              <p className="font-jakarta text-white/85 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </GlassSurface>
    </section>
  );
}

function Pricing() {
  return (
    <section
      className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-24 text-white"
      style={{
        '--background':          '222 47% 7%',
        '--foreground':          '0 0% 98%',
        '--card':                '222 40% 10%',
        '--card-foreground':     '0 0% 98%',
        '--muted':               '215 28% 16%',
        '--muted-foreground':    '215 20% 60%',
        '--border':              '215 25% 20%',
        '--input':               '215 25% 20%',
        '--primary':             '239 84% 72%',
        '--primary-foreground':  '0 0% 100%',
        '--accent':              '215 28% 16%',
        '--accent-foreground':   '0 0% 98%',
        '--ring':                '239 84% 72%',
      } as React.CSSProperties}
    >
      <PricingBlock
        plans={PRICING_PLANS}
        title="Simple, Transparent Pricing"
        description={"Start free. Upgrade when you're ready.\nNo hidden fees, cancel anytime."}
      />
    </section>
  );
}

const FAQ_ITEMS = [
  { q: 'Do I need a domain or hosting?', a: 'No. Your store is instantly live at a khanGates URL. You can connect a custom domain anytime from your dashboard.' },
  { q: 'How do customers place orders?', a: 'Customers browse your store and tap "Order via WhatsApp". You receive a structured order message directly in your WhatsApp.' },
  { q: 'Can I switch templates later?', a: 'Yes. You can change your store template at any time from the dashboard without losing any of your products or settings.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-24">
      <SectionHeader eyebrow="Support" title="Frequently asked questions" />
      <div className="mt-8 flex flex-col gap-3">
        {FAQ_ITEMS.map((item, i) => (
          <GlassSurface key={i} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-jakarta font-bold text-white text-[16px]">{item.q}</span>
              <span className="font-jakarta text-white/50 text-xl ml-4">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <div className="px-5 pb-5">
                <p className="font-jakarta text-white/65 text-sm leading-relaxed">{item.a}</p>
              </div>
            )}
          </GlassSurface>
        ))}
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="mx-auto max-w-[1120px] px-4 sm:px-6 pb-24">
      <GlassSurface className="p-10 sm:p-14 flex flex-col items-center text-center">
        <h2 className="font-jakarta font-extrabold text-3xl sm:text-4xl text-white mb-3">
          Ready to launch your store?
        </h2>
        <p className="font-jakarta text-white/65 text-base mb-8 max-w-md">
          Join thousands of merchants selling online with khanGates. No code, no hassle.
        </p>
        <IndigoBtn href="/onboarding">🚀 Start for Free</IndigoBtn>
      </GlassSurface>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${C.indigo}, ${C.indigoEnd})` }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="font-jakarta font-extrabold text-white text-lg">khanGates</span>
        </div>
        <p className="font-jakarta text-white/50 text-sm mb-6">
          The easiest way to sell online — beautiful storefronts, WhatsApp orders, zero code.
        </p>
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { label: 'Merchant Login', href: '/login', accent: true },
            { label: 'Start Free', href: '/onboarding' },
            { label: 'View Demo', href: '/templates/restaurant-default' },
          ].map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-jakarta text-sm font-semibold hover:opacity-100 transition-opacity"
              style={{ color: l.accent ? C.yellow : 'rgba(255,255,255,0.70)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <p className="font-jakarta text-white/30 text-xs">© {new Date().getFullYear()} khanGates. All rights reserved.</p>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, subtitle, light = false }: {
  eyebrow: string; title: string; subtitle?: string; light?: boolean;
}) {
  return (
    <div>
      <p className="font-jakarta text-xs font-bold tracking-widest uppercase mb-3" style={{ color: C.yellow }}>{eyebrow}</p>
      <h2 className={`font-jakarta font-extrabold text-3xl sm:text-4xl leading-tight ${light ? 'text-white' : 'text-white'}`}>{title}</h2>
      {subtitle && <p className="font-jakarta text-white/60 text-base mt-3">{subtitle}</p>}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#0A1628' }}>
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <TrustStrip />
        <Features />
        <HowItWorks />
        <Pricing />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </div>
  );
}
