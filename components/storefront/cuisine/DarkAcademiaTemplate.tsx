'use client';

import { useState } from 'react';
import type { StorefrontData } from '@/lib/types/store';
import { BookOpen, Plus, Minus } from 'lucide-react';
import { Cinzel, EB_Garamond } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600', '700', '900'], display: 'swap' });
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], display: 'swap' });

const C = {
  bg:       '#120A05',
  surface:  '#1E1007',
  parchment:'#F0E0C0',
  parchDim: 'rgba(240,224,192,0.55)',
  crimson:  '#8B1A1A',
  amber:    '#C4962A',
  amberDim: 'rgba(196,150,42,0.35)',
  ink:      '#2A1A08',
} as const;

export default function DarkAcademiaTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;
  const [cart, setCart] = useState<Record<number, number>>({});
  const [activeCategory, setActiveCategory] = useState('All');

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(p => p.id === Number(id));
    return sum + (p ? (p.discountPrice ?? p.price) * qty : 0);
  }, 0);

  const add = (id: number) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const sub = (id: number) => setCart(c => {
    const n = { ...c };
    if ((n[id] ?? 0) > 1) n[id]--;
    else delete n[id];
    return n;
  });

  const available = products.filter(p => p.available);
  const categories = ['All', ...Array.from(new Set(available.map(p => p.category)))];
  const filtered = activeCategory === 'All' ? available : available.filter(p => p.category === activeCategory);

  return (
    <>
      <style>{`
        @keyframes candleFlicker {
          0%,92%,100% { opacity: 1; transform: scale(1); }
          93%  { opacity: 0.85; transform: scale(0.98); }
          94%  { opacity: 1; transform: scale(1.01); }
          96%  { opacity: 0.78; transform: scale(0.97); }
          97%  { opacity: 1; transform: scale(1); }
          99%  { opacity: 0.88; }
        }
        @keyframes warmGlow {
          0%,100% { opacity: 0.45; transform: scale(1); }
          50%     { opacity: 0.65; transform: scale(1.06); }
        }
        @keyframes inkReveal {
          from { opacity: 0; transform: translateY(16px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes grainShift {
          0%  { transform: translate(0,0); }
          25% { transform: translate(-2px,2px); }
          50% { transform: translate(2px,-1px); }
          75% { transform: translate(-1px,3px); }
          100%{ transform: translate(0,0); }
        }
        @keyframes borderDraw {
          from { width: 0; }
          to   { width: 100%; }
        }
        .candle-flicker { animation: candleFlicker 5s ease-in-out infinite; }
        .warm-orb       { animation: warmGlow 4s ease-in-out infinite; }
        .ink-in         { animation: inkReveal 0.9s ease both; }
        .grain-overlay  {
          position: fixed; inset: 0; pointer-events: none; z-index: 1;
          opacity: 0.4;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          background-size: 180px 180px;
          animation: grainShift 6s steps(1) infinite;
        }
        .da-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          position: relative;
        }
        .da-card::before, .da-card::after {
          content: '';
          position: absolute;
          top: 6px; left: 6px; right: 6px; bottom: 6px;
          border: 1px solid rgba(196,150,42,0.12);
          pointer-events: none;
          transition: border-color 0.3s ease;
        }
        .da-card::after {
          top: 10px; left: 10px; right: 10px; bottom: 10px;
          border: 1px solid rgba(139,26,26,0.08);
        }
        .da-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(196,150,42,0.2), 0 4px 16px rgba(0,0,0,0.5);
        }
        .da-card:hover::before { border-color: rgba(196,150,42,0.28); }
        .da-card:hover::after  { border-color: rgba(139,26,26,0.2); }
        .ornament-line {
          display: block; height: 1px;
          background: linear-gradient(90deg, transparent, ${C.amber}, transparent);
          animation: borderDraw 1.2s 0.5s ease both;
        }
        .cat-tab {
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }
        .cat-tab:hover { color: ${C.amber} !important; }
      `}</style>

      <div className={`min-h-screen relative ${garamond.className}`} style={{ background: C.bg, color: C.parchment }}>
        <div className="grain-overlay" aria-hidden />

        {/* ═══════════════════════════════
            HERO
        ═══════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">

          {/* Candle warm glow */}
          <div className="warm-orb absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(196,150,42,0.18) 0%, rgba(139,26,26,0.1) 40%, transparent 70%)', filter: 'blur(50px)' }} />
          <div className="warm-orb absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none" style={{ width: 300, height: 200, background: 'radial-gradient(circle, rgba(196,150,42,0.08) 0%, transparent 70%)', filter: 'blur(40px)', animationDelay: '2s' }} />

          {/* Subtitle label */}
          <p className="ink-in mb-6 text-xs tracking-[0.5em] uppercase" style={{ animationDelay: '0s', color: C.amberDim }}>
            Est. Since the First Cup
          </p>

          {/* Store name — flickering like candlelight */}
          <div className="candle-flicker mb-4">
            <h1 className={`${cinzel.className} ink-in text-5xl sm:text-7xl lg:text-8xl font-bold leading-tight`} style={{ animationDelay: '0.15s', color: C.parchment, letterSpacing: '0.06em' }}>
              {store.shopName}
            </h1>
          </div>

          {/* Ornamental divider */}
          <div className="ink-in flex items-center gap-4 mb-6 w-full max-w-sm" style={{ animationDelay: '0.3s' }}>
            <span className="ornament-line flex-1" />
            <span className={`${cinzel.className} text-base`} style={{ color: C.amber }}>✦</span>
            <span className="ornament-line flex-1" />
          </div>

          <p className={`${garamond.className} ink-in text-lg sm:text-xl italic mb-10 max-w-md leading-relaxed`} style={{ animationDelay: '0.45s', color: C.parchDim }}>
            "{tc?.heroDescription || store.description}"
          </p>

          <button
            className={`${cinzel.className} ink-in px-10 py-3.5 text-xs tracking-[0.4em] uppercase cursor-pointer transition-all duration-300`}
            style={{
              animationDelay: '0.6s',
              border: `1px solid ${C.amberDim}`,
              color: C.amber,
              background: 'transparent',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(196,150,42,0.1)';
              el.style.borderColor = C.amber;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.borderColor = C.amberDim;
            }}
            onClick={() => document.getElementById('da-menu')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Open the Menu
          </button>

          <div className="absolute bottom-8 flex flex-col items-center gap-2" style={{ color: C.amberDim }}>
            <span className={`${cinzel.className} text-[9px] tracking-[0.4em] uppercase`}>Descend</span>
            <div className="w-px h-10" style={{ background: `linear-gradient(to bottom, ${C.amberDim}, transparent)` }} />
          </div>
        </section>

        {/* ═══════════════════════════════
            MENU
        ═══════════════════════════════ */}
        <section id="da-menu" className="max-w-5xl mx-auto px-4 sm:px-8 py-24">

          {/* Section header */}
          <div className="text-center mb-14">
            <p className={`${cinzel.className} text-[10px] tracking-[0.5em] uppercase mb-5`} style={{ color: C.amberDim }}>
              The Tome of Brews
            </p>
            <h2 className={`${cinzel.className} text-4xl sm:text-5xl font-semibold mb-6`} style={{ color: C.parchment }}>
              Today&apos;s Selection
            </h2>
            <div className="flex items-center gap-4 justify-center">
              <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to right, transparent, ${C.amberDim})` }} />
              <span className={`${cinzel.className} text-sm`} style={{ color: C.amber }}>✦</span>
              <div className="h-px flex-1 max-w-20" style={{ background: `linear-gradient(to left, transparent, ${C.amberDim})` }} />
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`${cinzel.className} cat-tab px-5 py-2 text-[10px] tracking-[0.3em] uppercase cursor-pointer`}
                  style={{
                    background: active ? 'rgba(196,150,42,0.12)' : 'transparent',
                    border: `1px solid ${active ? C.amber : C.amberDim}`,
                    color: active ? C.amber : C.parchDim,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Journal-style cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product, i) => {
              const qty = cart[product.id] ?? 0;
              const display = (product.discountPrice ?? product.price).toFixed(2);

              return (
                <div
                  key={product.id}
                  className="da-card p-7"
                  style={{
                    background: `linear-gradient(160deg, ${C.surface} 0%, ${C.bg} 100%)`,
                    border: `1px solid rgba(196,150,42,0.15)`,
                  }}
                >
                  {product.discountPrice && (
                    <span className={`${cinzel.className} inline-block mb-3 px-2 py-0.5 text-[9px] tracking-widest uppercase`} style={{ background: 'rgba(139,26,26,0.3)', color: '#D4885A', border: '1px solid rgba(139,26,26,0.4)' }}>
                      Special Price
                    </span>
                  )}

                  {/* Roman numeral index */}
                  <p className={`${cinzel.className} text-[10px] tracking-[0.4em] uppercase mb-2`} style={{ color: C.amberDim }}>
                    {['I','II','III','IV','V','VI','VII','VIII'][i % 8]} · {product.category}
                  </p>

                  <h3 className={`${cinzel.className} text-lg font-semibold mb-3 leading-snug`} style={{ color: C.parchment }}>
                    {product.name}
                  </h3>

                  <p className={`${garamond.className} text-base italic leading-relaxed mb-6`} style={{ color: C.parchDim }}>
                    {product.description}
                  </p>

                  {/* Thin amber rule */}
                  <div className="mb-5" style={{ height: 1, background: `linear-gradient(to right, ${C.amberDim}, transparent)` }} />

                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`${cinzel.className} text-xl font-semibold`} style={{ color: C.amber }}>
                        ${display}
                      </span>
                      {product.discountPrice && (
                        <span className="ml-2 text-sm line-through" style={{ color: 'rgba(196,150,42,0.3)' }}>
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-9 h-9 flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{ border: `1px solid ${C.amberDim}`, color: C.amber, background: 'transparent' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(196,150,42,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                      >
                        <Plus size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => sub(product.id)} className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors" style={{ border: `1px solid ${C.amberDim}`, color: C.amber, background: 'transparent' }}>
                          <Minus size={13} />
                        </button>
                        <span className={`${cinzel.className} text-sm font-semibold w-5 text-center`} style={{ color: C.amber }}>{qty}</span>
                        <button onClick={() => add(product.id)} className="w-8 h-8 flex items-center justify-center cursor-pointer transition-colors" style={{ border: `1px solid ${C.amberDim}`, color: C.amber, background: 'transparent' }}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer inscription */}
          <p className={`${cinzel.className} text-center text-[10px] tracking-[0.45em] uppercase mt-14`} style={{ color: 'rgba(196,150,42,0.2)' }}>
            ✦ &nbsp; {store.deliveryInfo} &nbsp; ✦
          </p>
        </section>

        {/* ═══════════════════════════════
            CART BAR
        ═══════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background: 'rgba(18,10,5,0.97)', borderTop: `1px solid rgba(196,150,42,0.22)`, backdropFilter: 'blur(20px)' }}>
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen size={18} style={{ color: C.amber }} />
                <span className={`${garamond.className} text-base italic`} style={{ color: C.parchDim }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className={`${cinzel.className} px-8 py-2.5 text-xs tracking-[0.3em] uppercase cursor-pointer transition-all duration-200`}
                style={{ border: `1px solid ${C.amber}`, color: C.ink, background: C.amber }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#D4A84C'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = C.amber; }}
              >
                Proceed — ${totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
