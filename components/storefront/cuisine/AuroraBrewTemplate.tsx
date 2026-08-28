'use client';

import { useState } from 'react';
import type { StorefrontData } from '@/lib/types/store';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { DM_Serif_Display, Outfit } from 'next/font/google';

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: ['400'], style: ['normal', 'italic'], display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

// Aurora colour palette
const A = {
  teal:   '#00E5C8',
  cyan:   '#00BFFF',
  purple: '#A78BFA',
  pink:   '#F472B6',
  green:  '#34D399',
};

// 20 hardcoded particles — varied so animation looks organic
const PARTICLES = [
  { x:8,   y:15, s:3, d:7,  del:0    },
  { x:18,  y:45, s:2, d:9,  del:1.2  },
  { x:28,  y:70, s:4, d:6,  del:0.4  },
  { x:38,  y:25, s:2, d:11, del:2.1  },
  { x:48,  y:55, s:3, d:8,  del:0.9  },
  { x:58,  y:35, s:2, d:10, del:1.7  },
  { x:68,  y:80, s:4, d:7,  del:0.2  },
  { x:78,  y:20, s:3, d:9,  del:3.0  },
  { x:88,  y:60, s:2, d:12, del:1.5  },
  { x:93,  y:40, s:3, d:6,  del:0.7  },
  { x:13,  y:85, s:2, d:8,  del:2.5  },
  { x:23,  y:10, s:4, d:11, del:1.0  },
  { x:43,  y:90, s:2, d:7,  del:3.3  },
  { x:53,  y:5,  s:3, d:9,  del:0.6  },
  { x:63,  y:75, s:2, d:10, del:1.8  },
  { x:73,  y:50, s:4, d:8,  del:2.8  },
  { x:83,  y:30, s:2, d:6,  del:0.3  },
  { x:33,  y:65, s:3, d:11, del:1.4  },
  { x:5,   y:50, s:2, d:9,  del:2.2  },
  { x:95,  y:75, s:3, d:7,  del:0.8  },
];

// Cycle through aurora colours per card index
const AURORA_ACCENTS = [A.teal, A.purple, A.cyan, A.pink, A.green, A.teal, A.purple, A.cyan];

export default function AuroraBrewTemplate({ data }: { data: StorefrontData }) {
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
        @keyframes aurora1 {
          0%,100% { transform: rotate(-12deg) translateX(0) scaleY(1); opacity: 0.55; }
          50%     { transform: rotate(-4deg) translateX(6%) scaleY(1.25); opacity: 0.8; }
        }
        @keyframes aurora2 {
          0%,100% { transform: rotate(8deg) translateX(0) scaleY(1); opacity: 0.45; }
          50%     { transform: rotate(14deg) translateX(-8%) scaleY(1.3); opacity: 0.7; }
        }
        @keyframes aurora3 {
          0%,100% { transform: rotate(-20deg) translateX(0) scaleY(0.9); opacity: 0.35; }
          50%     { transform: rotate(-10deg) translateX(10%) scaleY(1.1); opacity: 0.6; }
        }
        @keyframes aurora4 {
          0%,100% { transform: rotate(5deg) translateX(0); opacity: 0.3; }
          50%     { transform: rotate(-5deg) translateX(-5%); opacity: 0.55; }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.8; }
          50%  { transform: translateY(-40px) translateX(8px) scale(0.8); opacity: 0.5; }
          100% { transform: translateY(-80px) translateX(-4px) scale(0.4); opacity: 0; }
        }
        @keyframes titleGlow {
          0%,100% { text-shadow: 0 0 30px rgba(0,229,200,0.3), 0 0 60px rgba(0,191,255,0.15); }
          50%     { text-shadow: 0 0 50px rgba(0,229,200,0.5), 0 0 100px rgba(167,139,250,0.25); }
        }
        @keyframes auroraHeroBg {
          0%,100% { opacity: 0.7; }
          50%     { opacity: 1; }
        }
        @keyframes cardBorderCycle {
          0%,100% { box-shadow: 0 0 0 1px rgba(0,229,200,0.2); }
          50%     { box-shadow: 0 0 0 1px rgba(167,139,250,0.3); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .aurora-title { animation: titleGlow 4s ease-in-out infinite; }
        .ab-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .ab-card:hover { transform: translateY(-6px); }
        .hero-in { animation: fadeSlideUp 1s ease both; }
        .hero-in-2 { animation: fadeSlideUp 1s 0.2s ease both; }
        .hero-in-3 { animation: fadeSlideUp 1s 0.4s ease both; }
      `}</style>

      <div className={`min-h-screen relative overflow-x-hidden ${outfit.className}`} style={{ background: '#020C18', color: '#E8F4FF' }}>

        {/* ═══════════════════════════════
            AURORA BACKGROUND (fixed)
        ═══════════════════════════════ */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Band 1 — teal/green */}
          <div style={{
            position:'absolute', width:'160%', height:320,
            top:'0%', left:'-30%',
            background:`radial-gradient(ellipse 60% 100% at 50% 50%, rgba(0,229,200,0.38) 0%, transparent 70%)`,
            filter:'blur(48px)',
            animation:'aurora1 14s ease-in-out infinite',
          }} />
          {/* Band 2 — purple */}
          <div style={{
            position:'absolute', width:'170%', height:280,
            top:'8%', left:'-35%',
            background:`radial-gradient(ellipse 70% 100% at 50% 50%, rgba(167,139,250,0.28) 0%, transparent 70%)`,
            filter:'blur(55px)',
            animation:'aurora2 19s ease-in-out infinite',
          }} />
          {/* Band 3 — cyan */}
          <div style={{
            position:'absolute', width:'150%', height:240,
            top:'14%', left:'-25%',
            background:`radial-gradient(ellipse 55% 100% at 50% 50%, rgba(0,191,255,0.22) 0%, transparent 70%)`,
            filter:'blur(50px)',
            animation:'aurora3 22s ease-in-out infinite',
          }} />
          {/* Band 4 — subtle pink lower */}
          <div style={{
            position:'absolute', width:'140%', height:200,
            top:'20%', left:'-20%',
            background:`radial-gradient(ellipse 50% 100% at 50% 50%, rgba(244,114,182,0.14) 0%, transparent 70%)`,
            filter:'blur(60px)',
            animation:'aurora4 26s ease-in-out infinite',
          }} />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s, height: p.s,
                background: i % 5 === 0 ? A.teal : i % 5 === 1 ? A.purple : i % 5 === 2 ? A.cyan : i % 5 === 3 ? A.pink : A.green,
                animation: `particleDrift ${p.d}s ease-in ${p.del}s infinite`,
                opacity: 0.7,
              }}
            />
          ))}

          {/* Dark overlay — keeps text readable */}
          <div className="absolute inset-0" style={{ background: 'rgba(2,12,24,0.55)' }} />
        </div>

        {/* ═══════════════════════════════
            HERO
        ═══════════════════════════════ */}
        <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center z-10">

          {/* Location badge */}
          <div className="hero-in mb-8 px-5 py-1.5 rounded-full text-xs font-semibold tracking-[0.28em] uppercase" style={{ border:'1px solid rgba(0,229,200,0.25)', color:A.teal, background:'rgba(0,229,200,0.07)' }}>
            ◈ &nbsp;{store.shopName}&nbsp; ◈
          </div>

          {/* Heading */}
          <h1 className={`${dmSerif.className} hero-in-2 text-5xl sm:text-7xl lg:text-8xl font-normal leading-tight mb-6 aurora-title`} style={{ color:'#E8F4FF', letterSpacing:'-0.01em' }}>
            Where the<br />
            <em style={{ color: A.teal }}>Night</em> Brews
          </h1>

          <p className="hero-in-3 text-base sm:text-lg mb-12 max-w-sm leading-relaxed" style={{ color:'rgba(232,244,255,0.55)' }}>
            {tc?.heroDescription || store.description}
          </p>

          {/* CTA */}
          <button
            className="hero-in-3 px-10 py-3.5 rounded-full text-sm font-semibold tracking-wider uppercase cursor-pointer transition-all duration-300"
            style={{
              background: 'transparent',
              border: `1px solid ${A.teal}`,
              color: A.teal,
              animationDelay: '0.6s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'rgba(0,229,200,0.12)';
              el.style.boxShadow = `0 0 20px rgba(0,229,200,0.3)`;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'transparent';
              el.style.boxShadow = 'none';
            }}
            onClick={() => document.getElementById('ab-menu')?.scrollIntoView({ behavior:'smooth' })}
          >
            Explore Menu
          </button>

          {/* Aurora line scroll hint */}
          <div className="absolute bottom-8 flex flex-col items-center gap-2" style={{ color:'rgba(0,229,200,0.3)' }}>
            <div className="w-px h-12" style={{ background:`linear-gradient(to bottom, ${A.teal}60, transparent)` }} />
          </div>
        </section>

        {/* ═══════════════════════════════
            MENU
        ═══════════════════════════════ */}
        <section id="ab-menu" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 z-10">

          {/* Section header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-px" style={{ background:`linear-gradient(to right, transparent, ${A.teal})` }} />
              <span className="text-xs font-semibold tracking-[0.35em] uppercase" style={{ color: A.teal }}>Our Brews</span>
              <div className="w-12 h-px" style={{ background:`linear-gradient(to left, transparent, ${A.teal})` }} />
            </div>
            <h2 className={`${dmSerif.className} text-4xl sm:text-5xl`} style={{ color:'#E8F4FF' }}>
              The Menu
            </h2>
            <p className="mt-3 text-sm" style={{ color:'rgba(232,244,255,0.35)' }}>
              {tc?.openingHours || store.openingHours} · {store.deliveryInfo}
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase cursor-pointer transition-all duration-200"
                  style={{
                    border: `1px solid ${active ? A.teal : 'rgba(0,229,200,0.18)'}`,
                    color: active ? '#020C18' : 'rgba(0,229,200,0.55)',
                    background: active ? A.teal : 'rgba(0,229,200,0.05)',
                    boxShadow: active ? `0 0 16px rgba(0,229,200,0.4)` : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => {
              const accent = AURORA_ACCENTS[i % AURORA_ACCENTS.length];
              const qty = cart[product.id] ?? 0;
              const display = (product.discountPrice ?? product.price).toFixed(2);

              return (
                <div
                  key={product.id}
                  className="ab-card relative flex flex-col rounded-2xl p-5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${accent}28`,
                    backdropFilter: 'blur(16px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 22px ${accent}40, 0 0 44px ${accent}18`;
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}55`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}28`;
                  }}
                >
                  {product.discountPrice && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ background:`${accent}18`, color:accent, border:`1px solid ${accent}30` }}>
                      SALE
                    </span>
                  )}

                  {/* Aurora dot */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl mb-4 shrink-0" style={{ background:`${accent}14`, border:`1px solid ${accent}25` }}>
                    <span style={{ color: accent }}>✦</span>
                  </div>

                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color:`${accent}80` }}>
                    {product.category}
                  </p>
                  <h3 className={`${dmSerif.className} text-lg font-normal mb-2 leading-snug`} style={{ color:'#E8F4FF' }}>
                    {product.name}
                  </h3>
                  <p className="text-xs leading-relaxed flex-1 mb-5" style={{ color:'rgba(232,244,255,0.42)' }}>
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-lg font-semibold" style={{ color: accent }}>${display}</span>
                      {product.discountPrice && (
                        <span className="ml-2 text-xs line-through" style={{ color:'rgba(232,244,255,0.25)' }}>${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    {qty === 0 ? (
                      <button
                        onClick={() => add(product.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{ background:`${accent}14`, color:accent, border:`1px solid ${accent}30` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${accent}28`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${accent}14`; }}
                      >
                        <Plus size={16} />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => sub(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background:`${accent}14`, color:accent }}>
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold" style={{ color:accent }}>{qty}</span>
                        <button onClick={() => add(product.id)} className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer" style={{ background:`${accent}14`, color:accent }}>
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════
            CART BAR
        ═══════════════════════════════ */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50" style={{ background:'rgba(2,12,24,0.96)', borderTop:`1px solid rgba(0,229,200,0.18)`, backdropFilter:'blur(22px)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart size={20} style={{ color: A.teal }} />
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ background: A.purple, color:'#fff' }}>
                    {totalItems}
                  </span>
                </div>
                <span className="text-sm" style={{ color:'rgba(232,244,255,0.5)' }}>
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                className="px-8 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase cursor-pointer transition-opacity hover:opacity-90"
                style={{ background:`linear-gradient(90deg, ${A.teal}, ${A.purple})`, color:'#020C18' }}
              >
                Checkout — ${totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
